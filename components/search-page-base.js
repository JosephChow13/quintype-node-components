import React from 'react';
import {get} from 'lodash';

import { LoadMoreStoriesManager } from './load-more-stories-base'

export class SearchPageBase extends React.Component {
  search(pageNumber) {
    return superagent.get("/api/v1/search", {
      offset: (this.props.storiesPerPage || 20) * pageNumber,
      q: this.props.data.query,
      fields: this.props.fields
    }).then(response => get(response.body, ["results", "stories"], []));
  }

  render() {
    return React.createElement(LoadMoreStoriesManager, Object.assign({}, this.props.data, {
      foundTemplate: this.props.foundTemplate,
      notFoundTemplate: this.props.notFoundTemplate,
      loadStories: (pageNumber) => this.search(pageNumber)
    }));
  }
}
