import {
  ADD_LIST,
  //SORT_LISTS, 
  CLEAR_LIST,
  UPDATE_LIST,
  REMOVE_LIST,
  CURRENT_LIST,
  ADD_LIST_IMAGE,
  HIGHLIGHT_LIST,             // ... NEW ...
  OPEN_LISTS_MODAL,           // ... NEW ...
  CLOSE_LISTS_MODAL,          // ... NEW ...
  LIST_EDIT_CHANGE,
  UPDATE_LIST_SELECTED,       // ... NEW ...
  DELETE_SELECTED_LISTS
} from './actionTypes';
import store from '../../store';   // ... Realm DB Routines ...

/*

NEW:***********************************************************************

My First Realm Cloud Instance;
https://tracksome-live.us1.cloud.realm.io/

NEW:***********************************************************************

*/

export const propertyListChanged = (prop, value) => {
  return {
    type: LIST_EDIT_CHANGE,
    payload: { prop, value }
  };
};

export const addList = (key, name, desc, icon, type, thumb, mime, bcode) => {
  store.createList(key, name, desc, icon, type, thumb, mime, bcode);
  return {
    type: ADD_LIST,     // ... just need to inform Redux that something was added ...
  };
};

export const addListImage = (image) => {
  return {
    type: ADD_LIST_IMAGE,
    payload: { image }
  };
};

export const setListSelected = (key, isSelected) => {
  store.updateListSelected(key, isSelected);
  return {
    type: UPDATE_LIST_SELECTED
  };
};

export const updateList = (item) => {
  store.updateList(item);
  return {
    type: UPDATE_LIST
  };
};

export const highlightList = (key) => {
  return {
    type: HIGHLIGHT_LIST,
    payload: { key }
  };
};

export const currentList = (item) => {
  return {
    type: CURRENT_LIST,
    payload: { item }
  };
};

export const clearListItem = () => {
  return {
    type: CLEAR_LIST
  };
};

export const openListsModal = (key) => {
  return {
    type: OPEN_LISTS_MODAL,
    payload: { key }
  };
};

export const closeListsModal = (key) => {
  return {
    type: CLOSE_LISTS_MODAL,
    payload: { key }
  };
};

export const deleteList = (key) => {
  //-----------------------------------------------------------------------------
  // ... we should really do this within a transaction so we could roll back ...
  //-----------------------------------------------------------------------------
  store.deleteList(key);
  return {
    type: REMOVE_LIST
  };
};

export const deleteLists = () => {
  return {
    type: DELETE_SELECTED_LISTS
  };
};

//---------------------------------------------------------------
// ... the following functions need to be adjusted for Realm ...
//---------------------------------------------------------------