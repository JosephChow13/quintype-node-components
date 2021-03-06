import React from "react";
import {connect} from "react-redux";

function LoadingIndicatorBase(props) {
  return <div className={`loading-indicator ${props.loading ? 'loading-indicator-loading' : ''}`}>
    {props.loading && props.children}
  </div>
}

function mapStateToProps(state) {
  return {
    loading: state.pageLoading
  };
}

function mapDispatchToProps() {
  return {};
}

export const LoadingIndicator = connect(mapStateToProps, mapDispatchToProps)(LoadingIndicatorBase);
