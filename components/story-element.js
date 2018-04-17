import React from "react";
import classNames from "classnames";
import getYouTubeID from 'get-youtube-id';
import YouTube from 'react-youtube';
import JSEmbed from './story-elements/jsembed';
import { ResponsiveImage } from "./responsive-image";
import Polltype from './story-elements/polltype';
import {Table} from './story-elements/table';
import { Link } from './link';

function StoryElementText({element}) {
  return React.createElement("div", {dangerouslySetInnerHTML: {__html: element.text}});
}

function StoryElementAlsoRead({element, story}) {
  const storyUrl = story['linked-stories'] && '/' + story['linked-stories'][element.metadata['linked-story-id']]['slug'];
  const linkProps = { className: "story-element-text-also-read__link",
    href: storyUrl
  };
  return React.createElement("h3", {},
    React.createElement("span", { className: "story-element-text-also-read__label" }, "Also read: "),
    React.createElement(Link, linkProps, element.text)
  );
}

function StoryElementImage({element}) {
  return React.createElement("figure", {},
    React.createElement(ResponsiveImage, {
      slug: element["image-s3-key"],
      metadata: element["metadata"],
      aspectRatio: null,
      defaultWidth: 480,
      widths: [250,480,640],
      imgParams: {auto:['format', 'compress']}
    }),
    element.title ? React.createElement("figcaption", {dangerouslySetInnerHTML: {__html: element.title}, className: "story-element-image-title"}) : undefined,
    element['image-attribution'] ? React.createElement("figcaption", {dangerouslySetInnerHTML: {__html: element['image-attribution']}, className: "story-element-image-attribution"}) : undefined
  );
}

function StoryElementTitle({element}) {
  return React.createElement("h2", {}, element.text);
}

function StoryElementSoundCloud({element}) {
  return React.createElement("iframe", { 'src': element['embed-url'], 'width': '100%'} );
}

function StoryElementJsembed({element}) {
  return React.createElement(JSEmbed, {embedJS: element['embed-js'], id: element['id']});
}

function StoryElementYoutube({element}) {
  const opts = {
    playerVars: {
      autoplay: 0
    }
  };
  return React.createElement(YouTube, {videoId: getYouTubeID(element.url), opts:opts });
}

function StoryElementPolltype({element}) {
  return React.createElement(
    Polltype,
    {id: element['polltype-id']}
  );
}

function StoryElementTable({element}) {
  return React.createElement(Table, { id: element.id, data: element.data, hasHeader: element.metadata['has-header']});
}

// FIXME MISSING: composite
// TODO: Can also support various subtypes (though not needed potentially)

const DEFAULT_TEMPLATES = {
  "text": StoryElementText,
  "image": StoryElementImage,
  "title": StoryElementTitle,
  "youtube-video": StoryElementYoutube,
  "soundcloud-audio": StoryElementSoundCloud,
  "jsembed": StoryElementJsembed,
  "polltype": StoryElementPolltype,
  "table": StoryElementTable,
  "also-read": StoryElementAlsoRead
};

class StoryElementBase extends React.Component {

  constructor(props) {
    super(props);
    this.observer = {};
    this.madeCall = false;
  }

  componentDidMount() {
    this.engageObserver();
  }

  engageObserver() {
    this.observer = new IntersectionObserver((entries, observer) => this.handleObserver(entries, observer), {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    });
    this.observer.observe(this.myStoryElement);
  }

  generateAnalyticsData() {

    if(!this.props.story || !this.props.element){
      return {};
    }

    const {
      'story-content-id': storyContentId,
      'story-version-id': storyVersionId,
    } = this.props.story;

    const {
      id: storyElementId,
      type: storyElementType,
    } = this.props.element;

    const {
      'content-id': cardContentId,
      'content-version-id': cardContentVersionId,
    } = this.props.story.cards.find(card => card['story-elements'].some(ele => storyElementId === ele.id)) || {};

    return {
      'story-content-id': storyContentId,
      'story-version-id': storyVersionId,
      'card-content-id': cardContentId,
      'card-version-id': cardContentVersionId,
      'story-element-id': storyElementId,
      'story-element-type': storyElementType,
    };

  }

  handleObserver(entries = [], observer) {
    const [entry = {}] = [...entries];
    if(entry.isIntersecting &&!this.madeCall) {
      this.madeCall = true;
      global.qlitics('track', 'story-element-view', this.generateAnalyticsData());
    } else {
      this.madeCall = false;
    }
  }

  template() {
    const storyElement = this.props.element;
    const templates = Object.assign({}, DEFAULT_TEMPLATES, this.props.templates);
    return templates[storyElement.subtype] || templates[storyElement.type] || "div";
  }

  storyElement() {
    return this.props.element;
  }

  render() {
    const storyElement = this.props.element;
    const typeClassName = `story-element-${storyElement.type}`;
    const subtypeClassName = `story-element-${storyElement.type}-${storyElement.subtype}`;

    const storyElementTemplate = this.template();

    const { renderTemplates = {}, ...elementProps } = this.props;
    const renderTemplate = renderTemplates[storyElement.subtype] || renderTemplates[storyElement.type];

    return React.createElement("div", {
        className: classNames({
          "story-element": true,
          [typeClassName]: true,
          [subtypeClassName]: !!storyElement.subtype
        }),
        ref: node => this.myStoryElement = node
      }, (renderTemplate?
      React.createElement(
        renderTemplate,
        Object.assign({}, {element: storyElement}),
        React.createElement(storyElementTemplate, Object.assign({}, elementProps, {ref: node => this.myStoryElement = node}))
      ) : React.createElement(storyElementTemplate, Object.assign({}, elementProps)))
    )
  }
}

export class StoryElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {crashed: false};
  }

  componentDidCatch(error, stack) {
    this.setState({
      crashed: true,
      error: error
    });
    console && console.error(`Caught Exception: ${error && error.message}`)
  }

  render() {
    if(this.state.crashed) {
      return <div className="story-element story-element-crashed" />;
    } else {
      return React.createElement(StoryElementBase, this.props);
    }
  }
}

export const STORY_ELEMENT_TEMPLATES = DEFAULT_TEMPLATES;
