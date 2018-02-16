import { Navigation } from 'react-native-navigation';
import Login from './Login';
import BuildCard from './BuildCard';
import ShowCards from './ShowCards';
import ShowLists from './ShowLists';
import ShowNotes from './ShowNotes';
import EditCategories from './EditCategories';
// ... for building emojis DB - import EmojiPicker from './CreateJSONSortedEmojisFile';
import TrackSomeConfig from './drawers/SlideMenu';
import EmojiPicker from './EmojiPicker';
import SearchBar from '../components/SearchBar';

// ... register screens ...
export default (store, Provider) => {
  Navigation.registerComponent('tracksome.Login', () => Login, store, Provider);
  Navigation.registerComponent('tracksome.BuildCard', () => BuildCard, store, Provider);
  Navigation.registerComponent('tracksome.ShowCards', () => ShowCards, store, Provider);
  Navigation.registerComponent('tracksome.ShowNotes', () => ShowNotes, store, Provider);
  Navigation.registerComponent('tracksome.ShowLists', () => ShowLists, store, Provider);
  Navigation.registerComponent('tracksome.EditCategories', () => EditCategories, store, Provider);
  Navigation.registerComponent('tracksome.EmojiPicker', () => EmojiPicker, store, Provider);
  Navigation.registerComponent('tracksome.ConfigMenu', () => TrackSomeConfig, store, Provider);
};

// ... register screens that don't need redux ...
Navigation.registerComponent('tracksome.SearchBar', () => SearchBar);
