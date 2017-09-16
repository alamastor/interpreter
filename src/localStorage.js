/* @flow */

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState != null) {
      return JSON.parse(serializedState);
    } else {
      return undefined;
    }
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("state", serializedState);
  } catch (err) {
    console.log("failed to save state to localstorage.");
  }
};
