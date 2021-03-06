import React from "react";
import {connect} from "react-redux";

class ClientSideOnlyBase extends React.Component {
  render() {
    if (this.props.clientSideRendered) {
      return <div className="client-side-only client-side-only-client">{this.props.children}</div>;
    } else {
      return React.createElement(
        this.props.serverComponent || "div",
        Object.assign({ className: "client-side-only client-side-only-server" }, this.props)
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    clientSideRendered: state.clientSideRendered
  }
}

function mapDispatchToProps(dispatch) {
  return {};
}

export const ClientSideOnly = connect(mapStateToProps, mapDispatchToProps)(ClientSideOnlyBase);
