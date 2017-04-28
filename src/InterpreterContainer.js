/* @flow */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InterpreterView from './InterpreterView';

const mapStateToProps = (state, ownProps) => ({
  code: state.code,
  interpreter: parseInt(ownProps.match.params.id),
})

const mapDispatchToProps = (dispatch) => {
  return {
    onSetCode: (code) => (dispatch({
      type: 'code_update',
      code: code,
    }))
  }
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(InterpreterView)

export default AppContainer;