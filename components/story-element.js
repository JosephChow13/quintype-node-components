import React from "react";
import classNames from "classnames";
import getYouTubeID from 'get-youtube-id';
import YouTube from 'react-youtube';
import SoundCloudPlayer from 'react-soundcloud-widget';
import JSEmbed from './story-elements/jsembed';
import { ResponsiveImage } from "./responsive-image";
import Polltype from './story-elements/polltype';

function storyElementText(storyElement) {
  return React.createElement("div", {dangerouslySetInnerHTML: {__html: storyElement.text}});
}

function storyElementImage(storyElement) {
  return React.createElement("figure", {},
    React.createElement(ResponsiveImage, {
      slug: storyElement["image-s3-key"],
      metadata: storyElement["metadata"],
      aspectRatio: null,
      defaultWidth: 480,
      widths: [250,480,640],
      imgParams: {auto:['format', 'compress']}
    }),
    storyElement.title ? React.createElement("figcaption", {dangerouslySetInnerHTML: {__html: storyElement.title}, className: "story-element-image-title"}) : undefined,
    storyElement.attribution ? React.createElement("figcaption", {dangerouslySetInnerHTML: {__html: storyElement.attribution}, className: "story-element-image-attribution"}) : undefined
  );
}

function storyElementTitle(storyElement) {
  return React.createElement("h2", {}, storyElement.text);
}

function storyElementSoundCloud(storyElement) {
  return React.createElement(SoundCloudPlayer, {url: storyElement.url });
}

function storyElementJsembed(storyElement) {
  return React.createElement(JSEmbed, {embedJS: storyElement['embed-js'], id: storyElement['id']});
}

function storyElementYoutube(storyElement) {
  const opts = {
    playerVars: {
      autoplay: 0
    }
  };
  return React.createElement(YouTube, {videoId: getYouTubeID(storyElement.url), opts:opts });
}

function storyElementPolltype(storyElement) {
  return React.createElement(
    Polltype,
    {id: storyElement['polltype-id']}
  );
}

// FIXME MISSING: composite
// TODO: Can also support various subtypes (though not needed potentially)
const DEFAULT_TEMPLATES = {
  "text": {render: storyElementText},
  "image": {render: storyElementImage},
  "title": {render: storyElementTitle},
  "youtube-video": {render: storyElementYoutube},
  "soundcloud-audio": {render: storyElementSoundCloud},
  "jsembed": {render: storyElementJsembed},
  "polltype": {render: storyElementPolltype}
};

export class StoryElement extends React.Component {
  template() {
    const storyElement = this.props.element;
    const templates = Object.assign({}, DEFAULT_TEMPLATES, this.props.templates);
    return Object.assign(
      {render: () => [], componentDidMount: () => true, componentWillUnmount: () => true},
      templates[storyElement.type],
      templates[storyElement.subtype]
    );
  }

  componentDidMount() {
    const componentDidMount = this.template().componentDidMount;
    if(componentDidMount)
      componentDidMount.call(this);
  }

  componentWillUnmount() {
    const componentWillUnmount = this.template().componentWillUnmount;
    if(componentWillUnmount)
      componentWillUnmount.call(this);
  }

  storyElement() {
    return this.props.element;
  }

  render() {
    const storyElement = this.props.element;
    const typeClassName = `story-element-${storyElement.type}`;
    const subtypeClassName = `story-element-${storyElement.type}-${storyElement.subtype}`;

    return React.createElement("div", {
      className: classNames({
        "story-element": true,
        [typeClassName]: true,
        [subtypeClassName]: !!storyElement.subtype
      })
    }, this.template().render.call(this, this.props.element, this.props.story))
  }
}

export const STORY_ELEMENT_TEMPLATES = DEFAULT_TEMPLATES;
