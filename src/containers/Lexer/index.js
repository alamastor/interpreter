/* @flow */
import React from "react";
import TokenView from "./TokenView";
import type { Token } from "../../interpreter/Token";
import { UnexpectedChar } from "../../interpreter/Lexer";
import type { State } from "../../store";
import type { Dispatch } from "../../store";
import { connect } from "react-redux";

const mapStateToProps = (state: State) => ({
  minimized: state.lexer.minimized,
  tokenList: state.code.tokenList,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClickTokensToggle: () =>
    dispatch({
      type: "interpreter_view_tokens_toggle_click",
    }),
  onHoverToken: tokenOrError =>
    dispatch({
      type: "token_hover",
      tokenOrError: tokenOrError,
    }),
  onStopHoverToken: () =>
    dispatch({
      type: "token_hover_stop",
    }),
});

type Props = {|
  minimized: boolean,
  tokenList: Array<Token | UnexpectedChar>,
  onClickTokensToggle: () => void,
  onHoverToken: (Token | UnexpectedChar) => void,
  onStopHoverToken: () => void,
|};
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
        {props.tokenList.map((tokenOrError, i) =>
          <TokenView
            tokenOrError={tokenOrError}
            onHoverToken={props.onHoverToken}
            onStopHoverToken={props.onStopHoverToken}
            key={i}
          />,
        )}
      </ul>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(LexerView);
