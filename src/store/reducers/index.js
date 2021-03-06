import { combineReducers } from 'redux';
//import TagReducer from './TagReducer';
//import RootReducer from './RootReducer';
import RootReducer from './RootReducer';
import EmojiReducer from './EmojiReducer';
import LoginInfo from './AuthReducer';
import CardReducer from './CardReducer';
import NoteReducer from './NoteReducer';
import ListReducer from './ListReducer';
import CategoryReducer from './CategoryReducer';

const MainReducer = combineReducers({
  root: RootReducer,  
  login: LoginInfo,
  cards: CardReducer,
  notes: NoteReducer,
  lists: ListReducer,
  emojis: EmojiReducer,
  categories: CategoryReducer
});

export default MainReducer;
