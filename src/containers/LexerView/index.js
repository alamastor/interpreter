/* @flow */
import React from "react";
import TokenView from "./TokenView";
import type { Token } from "../../interpreter/Token";
import type { State } from "../../store";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onClickTokensToggle, onHoverToken, onStopHoverToken } from "./actions";
import type { Action } from "../../actionTypes";

const mapStateToProps = (state: State) => ({
  minimized: state.lexerView.minimized,
  tokenList: state.interpreterPage.tokenList,
});

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      onClickTokensToggle,
      onHoverToken,
      onStopHoverToken,
    },
    dispatch,
  );

type Props = {
  minimized: boolean,
  tokenList: Array<Token>,
  onClickTokensToggle: () => Action,
  onHoverToken: Token => Action,
  onStopHoverToken: () => Action,
};
const LexerView = (props: Props) => {
  return (
    <div>
      <h4 className="lexer--header">
        Token Stream
        <button className="toggle-button" onClick={props.onClickTokensToggle}>
          {props.minimized ? "+" : "-"}
        </button>
      </h4>
      <ul
        className="lexer--list"
        style={{ display: props.minimized ? "none" : "block" }}
      >
        {props.tokenList.map((token, i) => (
          <TokenView
            token={token}
            onHoverToken={props.onHoverToken}
            onStopHoverToken={props.onStopHoverToken}
            key={i}
          />
        ))}
      </ul>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(LexerView);
