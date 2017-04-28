/* @flow */
import { connect } from 'react-redux';
import InterpreterView from './InterpreterView';

const mapStateToProps = (state, ownProps) => ({
  code: state.code,
  interpreterVer: parseInt(ownProps.match.params.id, 10),
})

const mapDispatchToProps = dispatch => ({
  onSetCode: (code) => (dispatch({
    type: 'code_update',
    code: code,
  }))
})

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(InterpreterView)

export default AppContainer;