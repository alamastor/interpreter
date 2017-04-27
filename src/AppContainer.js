/* @flow */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppView from './AppView';

const mapStateToProps = (state) => ({
  code: state.code,
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
)(AppView)

export default AppContainer;