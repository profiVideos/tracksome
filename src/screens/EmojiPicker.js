import React, { PureComponent } from 'react';
import {
  Text,
  View,
  Alert,
  FlatList,
  Platform,
  //TextInput,
  StyleSheet,
  ToastAndroid,
  //ActivityIndicator,
  TouchableNativeFeedback
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider
} from 'react-native-popup-menu';

import AppColors from '../templates/appColors';
import emojiData from '../store/data/sorted-emojis.json';
import EmojiTabBar from './EmojiTabBar';
import EmojiItem from '../components/EmojiItem';
import { 
  addEmoji, 
  updateEmoji, 
  currentEmoji,
  loadMyEmojis
} from '../store/actions';

//console.warn('Emojis are loading ... ');
//console.log(emojiData);
// ... our new stripped down version of the emoji database ...
/*
    const newObject = { 
      cat: item.category, 
      emoji: charFromCode(item.unified),
      sort: item.sort_order,
      name: item.short_name };
    return newObject;
*/

const emojiCats = [
  'My Favorite Emojis',
  'Smileys & People',
  'Animals & Nature', 
  'Food & Drink', 
  'Activities', 
  'Travel & Places', 
  'Objects', 
  'Symbols', 
  'Flags'
];
//console.log(emojiCats);

/*
[ ... sort order as per whapsapp ...
9) 'REC', "Recently Used"
8) 'SMI', "Smileys & People"
6) 'ANI', "Animals & Nature", 
1) 'FOO', "Food & Drink", 
2) 'ACT', "Activities", 
0) 'TRV', "Travel & Places", 
7) 'OBJ', "Objects", 
4) 'SYM', "Symbols", 
3) 'FLG', "Flags", 
5) 'SKN', "Skin Tones", ... not used (why is this an extra category?) ...
]
*/

const listItemHeight = 65;          // ... used to calculate faster scrolls (pass to EmojiItem) ...

const IconMenuOption = (props) => (
  <MenuOption 
    value={props.value} 
    text={`${props.icon}  ${props.text}`} 
  />
);

const whatDoYouNeed = state => {
  return {
    saveMode: state.login.saveMode,
    myEmojis: state.emojis.myEmojis,
    emojiCode: state.emojis.emojiCode,
    emojiName: state.emojis.emojiName,
    listUpdated: state.emojis.lastUpdated   // ... tells FlatList we have updated Realm data ...
  };
};

class EmojiPicker extends PureComponent {
  static navigatorStyle = {
    //tabBarHidden: true,   // ... we need space for the emojis ...
    drawUnderNavBar: false,
    screenBackgroundColor: AppColors.paperColor,
    navBarTextColor: AppColors.mainLiteColor,
    navBarBackgroundColor: AppColors.hiliteColor,
    navBarTranslucent: false
  }

  constructor(props) {
    super(props);
    this.tabBarState = 'hidden';
    this.onEmojiCloseSelf = this.onEmojiCloseSelf.bind(this);    
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      checked: false,   // ... used to test the switch component ...
      loading: false,
      canEdit: false,
      refresh: false,
      emojisClicked: ''
    };
  }

/*
... to force flatlist to update ... not exactly the issue I'm having with the sort...
<FlatList> 
  ... data={this.props.searchBookResults} 
  extraData={this.state.refresh} 
  onPress={()={this.setState({ refresh: !refresh})}
*/

  componentWillMount() {
    this.props.dispatch(loadMyEmojis());
  }

  //componentWillReceiveProps(nextProps) {
    // ... if the emojis list is dirty (used) then we should save it ...
    //console.log('Emoji List Updated: ', nextProps.listUpdated);
    //------------------------------------------------------
    // ... do this purely for debugging purposes so we ...
    // ... can see the data being returned from Realm ...
    //------------------------------------------------------
    //if (this.props.listUpdated !== nextProps.listUpdated) {
      //console.log('New MyEmojis: ', JSON.stringify(nextProps.myEmojis));
    //}
  //}

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id === 'close') { // this is the same id field from the static navigatorButtons
        this.toggleTabs();
      }
      if (event.id === 'menu') {
        this.props.navigator.toggleDrawer({ side: 'left', animated: true });
        //this.props.navigator.showModal({ screen: 'tracksome.EmojiPicker' });
      }
    }
  }

/*
  onTouchPress = () => { 
    this.props.onSelectItem(this.props.emojiName, this.props.emojiString);
  } 

  onTouchLongPress = () => { 
    this.props.onToggleItem(this.props.emojiName, this.props.emojiString);
  } 
*/

  onSelectItem = (name, emoji) => {  // ... a normal selected item (press and go) ...
    this.setState({ emojisClicked: `${emoji} ${this.state.emojisClicked}` });
    const dataStore = this.props;
    dataStore.dispatch(currentEmoji(emoji, name));
    const locatePos = this.findEmojiByName(name);
    if (locatePos >= 0) {
      const emojiKey = this.props.myEmojis[locatePos].key;
      dataStore.dispatch(updateEmoji(
        emojiKey, 
        this.props.myEmojis[locatePos].selected,
        this.props.myEmojis[locatePos].numUsed + 1));
    } else {
      // ... call the GUID function to generate a new unique id or key ...
      dataStore.dispatch(addEmoji(emoji, name));
      ToastAndroid.show('Added to Favs', ToastAndroid.SHORT);      
    }
  }

  onToggleItem = (emojiKey) => {   // ... editing favorite emojis list ...
    if (this.state.canEdit) {
      const locatePos = this.findEmojiByKey(emojiKey);
      if (locatePos >= 0) {
        const dataStore = this.props;
        dataStore.dispatch(updateEmoji(
          emojiKey, 
          !this.props.myEmojis[locatePos].selected, 
          this.props.myEmojis[locatePos].numUsed));
      }
    }
  }

  onEmojiCloseSelf() {
    //console.log('Should close this window!');
    this.props.navigator.dismissModal({
      animationType: 'slide-down'
    });
  }   

/*
  onToggleItem = (name, emoji) => {
    this.setState({ emojisClicked: `${emoji} ${this.state.emojisClicked}` });
    const dataStore = this.props;
    dataStore.dispatch(currentEmoji(emoji, name));
    const locatePos = this.findEmoji(name);
    if (locatePos >= 0) {
      const emojiKey = this.props.myEmojis[locatePos].key;
      // ... if on the my Fav Emojis screen - toggle item on/off ...
      if (this.state.canEdit) {
        const isSelected = !this.props.myEmojis[locatePos].selected;
        dataStore.dispatch(updateEmoji(emojiKey, 
          isSelected, this.props.myEmojis[locatePos].numUsed + 1));
      } else {
        dataStore.dispatch(updateEmoji(emojiKey, 
          false, this.props.myEmojis[locatePos].numUsed + 1));
      }
    } else {
      // ... call the GUID function to generate a new unique id or key ...
      dataStore.dispatch(addEmoji(UniqueId(), emoji, name));
    }
  };

    this.setState((state) => {
      // ... copy the map rather than modifying state ...
      const selected = new Map(state.selected);
      selected.set(id, !selected.get(id)); // ... toggle item ...
      return { selected };
    });
*/

  onEmojiListRefresh() {
    //console.log('The flatlist component has done a refresh ... ');
    //console.log('Refreshing flag is ', this.state.refreshing);
  }

  onMenuOptionSelect = (value) => {
    switch (value) {
      case 'clearEmojis': {
        // ... delete all selected emojis without asking ...
        Alert.alert('We need to unselect ALL selected Emojis!');
        break;
      }
      case 'deleteSelected': {
        // ... delete all selected emojis without asking ...
        Alert.alert('We need to delete all selected Emojis!');
        break;
      }
      case 'deleteAllEmojis': {
        // ... delete all selected emojis without asking ...
        Alert.alert('We are going to delete ALL Emojis!');
        break;
      }
      default: break;
    }  // ... switch ...
  }

  getItemLayout = (data, index) => (  // ... so flatlist can scroll faster ...
    { length: listItemHeight, offset: listItemHeight * index, index }
  );

  setEditFlag = (allowEdits) => {
    this.setState({ canEdit: allowEdits });
  };

  findEmojiByKey(key) {
    return this.props.myEmojis.findIndex((element) => { return element.key === key; });
  }

  findEmojiByName(name) {
    return this.props.myEmojis.findIndex((element) => { return element.name === name; });
  }

  toggleSwitch = () => {
    this.setState({ checked: !this.state.checked });
  }
  
  toggleTabs = () => {
    const to = this.tabBarState === 'shown' ? 'hidden' : 'shown';
    this.props.navigator.toggleTabs({
      to,
      animated: true
    });
    this.tabBarState = to;
  };

  showEmojis = (emojiGroup) => (
    <FlatList
        numColumns={6}
        horizontal={false}
        data={emojiGroup}
        initialNumToRender={3}  // ... 3 ...
        extraData={this.props.listUpdated}
        // ... not sure how these work??? refreshing={this.state.refreshing}
        // ...... Set this true while waiting for new data from a refresh.
        // legacyImplementation - does not work on multiple columns ...
        //onRefresh={this.onEmojiListRefresh}
        removeClippedSubviews
        getItemLayout={this.getItemLayout}
        keyExtractor={(item, index) => index}
        renderItem={this.renderEmojiItem}
        // ... useful for an activity spinner - ListHeaderComponent={this.renderOptionMenu}
    />
  );

  renderEmojiItem = ({ item }) => {
    return (
      <EmojiItem 
        emojiString={item.emoji}
        emojiName={item.name}
        emojiKey={item.key}
        usageNum={item.numUsed}
        isChecked={item.selected}
        canEdit={this.state.canEdit}
        itemHeight={listItemHeight}
        onTapItem={this.onSelectItem}
        onLongPress={this.onToggleItem}
        //selected={!!this.state.selected.get(item.id)}
      />
    );
  }

  renderOptionMenu = () => (
    //if (!this.state.canEdit) return null;
    //return (
      <Menu onSelect={value => this.onMenuOptionSelect(value)}>
        <MenuTrigger>
          <View style={{ width: 20, alignItems: 'center' }}>
            <Icon name='md-more' size={24} color={AppColors.darkerColor} />
          </View>
        </MenuTrigger>
        <MenuOptions customStyles={menuOptionsStyles}>
          <MenuOption value={0} disabled>
            <Text style={styles.menuTitle}>Emoji Options</Text>
          </MenuOption>
          <IconMenuOption value={'clearEmojis'} icon='🔄' text='Clear All Selected' />
          <IconMenuOption value={'deleteSelected'} icon='🗑️' text='Delete All Selected' />
          <IconMenuOption value={'deleteAllEmojis'} icon='✂' text='Remove Your Emojis' />
        </MenuOptions>
      </Menu>
    //);
  )

  renderHeader = () => {
    /*
    if (!this.state.loading) return null;
    return (
      <View style={{ paddingVertical: 20, borderTopWidth: 1, borderColor: '#CED0CE' }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
    */
  }

  render() {
    const backColor = this.props.emojiCode === '' ? 'transparent' : 'white';
    //console.log(this);
    return (
      <MenuProvider>
        <View style={styles.outerContainer}>
          <View style={styles.statusBar}>
            <View style={styles.historyBar} >
              <Text ellipsizeMode='tail' numberOfLines={1} style={styles.textHistory}>
                {this.state.emojisClicked}
              </Text>
            </View>
            <View style={[styles.iconPaper, { backgroundColor: backColor }]}>
              <Text style={styles.iconPreview}>
                {this.props.emojiCode}
              </Text>
            </View>
            <TouchableNativeFeedback onPress={this.onEmojiCloseSelf}>
              <Icon name='md-checkmark-circle-outline' size={38} color={AppColors.paperColor} />
            </TouchableNativeFeedback>
          </View>

          <ScrollableTabView
            style={{ backgroundColor: '#f2f2f2' }}
            initialPage={0}
            //tabBarPosition='overlayTop'
            renderTabBar={() =>
              <EmojiTabBar 
                tabGroupTitle={emojiCats}
                optionMenu={this.renderOptionMenu}
                canEdit={this.setEditFlag} 
              />
            }
          >
            <View tabLabel="stopwatch" style={styles.tabView}>
              {this.showEmojis(this.props.myEmojis)}
            </View>
            <View tabLabel="happy" style={styles.tabView}>
              {this.showEmojis(emojiData.filter((item) => item.cat === 'SMI'))}
            </View>
            <View tabLabel="paw" style={styles.tabView}>
              {this.showEmojis(emojiData.filter((item) => item.cat === 'ANI'))}
            </View>
            <View tabLabel="pizza" style={styles.tabView}>
              {this.showEmojis(emojiData.filter((item) => item.cat === 'FOO'))}
            </View>
            <View tabLabel="tennisball" style={styles.tabView}>
              {this.showEmojis(emojiData.filter((item) => item.cat === 'ACT'))}
            </View>
            <View tabLabel="plane" style={styles.tabView}>
              {this.showEmojis(emojiData.filter((item) => item.cat === 'TRV'))}
            </View>
            <View tabLabel="bulb" style={styles.tabView}>
              {this.showEmojis(emojiData.filter((item) => item.cat === 'OBJ'))}
            </View>
            <View tabLabel="star" style={styles.tabView}>
              {this.showEmojis(emojiData.filter((item) => item.cat === 'SYM'))}
            </View>
            <View tabLabel="flag" style={styles.tabView}>
              {this.showEmojis(emojiData.filter((item) => item.cat === 'FLG'))}
            </View>
          </ScrollableTabView>

        </View>
      </MenuProvider>
    );
  }
}

export default connect(whatDoYouNeed)(EmojiPicker);

const menuOptionsStyles = {
  optionsContainer: {
    width: 180,
    padding: 2,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: AppColors.darkerColor,  // ... dark cyan ...
  },
  optionText: {
    color: 'white',
  },
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: AppColors.paperColor
  },
  menuTitle: {
    fontWeight: '500', 
    color: AppColors.accentColor,
    paddingBottom: 3,
    borderBottomColor: '#aaa',
    borderBottomWidth: 0.75
  },
  statusBar: {
    height: 44,
    flexDirection: 'row',
    padding: (Platform.OS === 'android' ? 2 : 2),
    alignItems: 'center',
    backgroundColor: AppColors.darkerColor,  // ... dark cyan ...
    justifyContent: 'space-around'
  },
  historyBar: {
    height: 32,
    //paddingBottom: 2,
    flexDirection: 'row',
    borderRadius: 15,
    alignItems: 'center',
    width: '65%',
    backgroundColor: '#d5d5d5'
  },
  textHistory: {
    color: 'black',
    fontSize: 18,
    alignSelf: 'center',
    marginBottom: 2,
    paddingLeft: 8,
    paddingRight: 8
  },
  tabView: {
    flex: 1,
    padding: 0,
    backgroundColor: AppColors.paperColor
  },
  iconPaper: {
    paddingBottom: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    backgroundColor: 'transparent'
  },
  iconPreview: {
    color: 'black',
    fontSize: 29,
    textAlign: 'center',
    paddingBottom: 1
  },  
  card: {
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: 'rgba(0,0,0,0.25)',
    margin: 5,
    height: 150,
    padding: 15,
    shadowColor: '#ccc',
    shadowOffset: { width: 2, height: 2, },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },  
  icon: {
    width: 300,
    height: 300,
    alignSelf: 'center'
  },  
  textInput: {
    alignSelf: 'stretch',
    borderRadius: 5,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

/*
              {(this.state.emojiCode === '' ? null : this.state.emojiCode)}
            {this.showEmojiList(sortedEmojis.filter((item) => item.category === 'flag'))}
sortedEmojis.filter((item) => item.category === thisGroup)

9) "Recently Used" - Clock
8) "Smileys & People" - Smiley
6) "Animals & Nature", - Teddy Bear
1) "Food & Drink", - Coffee Cup
2) "Activities", - Soccer Ball
0) "Travel & Places", Car from Front
7) "Objects", - Lightbulb
4) "Symbols", - Number Sign # on Key
3) "Flags", - Flag Symbol
5) "Skin Tones", ... not used (why is this an extra category?) ...

  
      <Text style={styles.textValue}>{item.short_names.slice(0, 1)} </Text>

    <EmojiItem 
      id={item.id}
      thumbNail={item.thumb}
      Name={item.title}
      Teaser={item.headline}
      Description={item.description}
      onPressItem={this.onPressItem}
      selected={!!this.state.selected.get(item.id)}
    />

onPress={() => this.setState({checked: !this.state.checked})    
          onPress={(checked) => this.toggleSwitch(checked)} 

  state = {
    toggled: false,
    dataObj: [{ id: 10 }, { id: 20 }]
    //scrWidth: Dimensions.get('window').width,
    //scrHeight: Dimensions.get('window').height,
    //viewMode: this.scrHeight > this.scrWidth ? 'portrait' : 'landscape'
  }

    // every 20 cards, inject an advertisment
    var modulusCount = 0;
    if ((this.state.labels.length - modCount) % 20 === 0) {
                        this.state.labels.push({type: 'ad'});
                        modulusCount++;
                    }

    _renderItem = ({item}) => {
        switch (item.type) {
            case 'label':
                return <Card key={item._id} style={styles.card}>
                    <CardTitle title={item.description}/>
                    <TouchableOpacity style={styles.image} onPress={() => 
                      this._showImage(item.imagepath, item.upvotes, item._id)} activeOpacity={0.7}>
                        <CardImage seperator={false} id={item._id} inColumn={false} 
                        source={{uri: item.imagepath}}/>
                    </TouchableOpacity>
                </Card>;
            case 'ad':
                return (this.state.fbad && this.state.ads ?
                    <View key={item._id}>
                        <Card style={styles.card}>
                            <CardTitle title={'Sponsored'}/>
                            <BannerView
                                placementId={placementId}
                                type="large"
                                style={{width: 100}}
                                onPress={() => console.log('click')}
                                onError={this.onBannerAdError}
                            />
                        </Card>
                    </View>
                    : null );
            default:
                return null;
        }
    };

                 <View style={styles.view}>
                        <FlatList
                            data={this.state.labels}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                            onScroll={this._onScroll}
                            refreshing={this.state.refreshing}
                            onRefresh={this.handleRefresh}
                            onEndReached={this.handleLoadMore}
                            onEndReachedThreshold={0.1}
                            onMomentumScrollBegin={() => {
                                this.onEndReachedCalledDuringMomentum = false;
                            }}
                            OK, got it - removeClippedSubviews={true}
                            ListFooterComponent={this.renderFooter}
                        />
                    </View>
                </View>

*/

/*-------------------------------------------------------------------------
/* ... 11.1.2018 - other notes on EmojiList handling ...
/*-------------------------------------------------------------------------

https://github.com/facebook/react-native/issues/13649
Cool article on FlatList speed improvements!
https://blog.beeaweso.me/using-apollo-client-2-0-with-redux-in-wix-react-native-navigation-8aa9590d4ea1
Most cool - redux, navigator & apollo DB client all working together!!!!
https://github.com/zmxv/react-native-sound

-----------------------------------------------------------------------------------
 SIMPLE STATE HANDLING EXAMPLE
-----------------------------------------------------------------------------------

 state = {
    todos: ['Click to remove', 'Learn React Native', 'Write Code', 'Ship App'],
  }

  onAddTodo = (text) => {
    const {todos} = this.state
    this.setState({
      todos: [text, ...todos],
    })
  }

  onFindTodo = (text) => {
    const {todos} = this.state
    // ... try to find this one in the list ...
    // ... if found - return the key & true ...
    // ... otherwise return null & false ...
  }
  
  onUpdateTodo = (key, text) => {
    const {todos} = this.state
    // ... first find the one to update ...
    // ... if found then update - else we add it ...
    // ... copy all stuff up to the current item ...
    // ... insert in the updated item ...
    // ... copy all items after the inserted update ...
    // ... return the result ...
    this.setState({
      todos: [text, ...todos],
    })
  }

  onRemoveTodo = (key) => {
    const {todos} = this.state
    this.setState({
      todos: todos.filter((todo, i) => i !== key),
    })
  }

-----------------------------------------------------------------------------------
 LOCAL STORAGE EXAMPLE ( looks like it is using AsyncStorage )
-----------------------------------------------------------------------------------

// our array
var movies = ["Reservoir Dogs", "Pulp Fiction", "Jackie Brown", 
"Kill Bill", "Death Proof", "Inglourious Basterds"];
 
// storing our array as a string
localStorage.setItem("quentinTarantino", JSON.stringify(movies));
 
// retrieving our data and converting it back into an array
var retrievedData = localStorage.getItem("quentinTarantino");
var movies2 = JSON.parse(retrievedData);
 
//making sure it still is an array
alert(movies2.length);

-----------------------------------------------------------------------------------
 ASYNCSTORAGE EXAMPLE
-----------------------------------------------------------------------------------

https://github.com/jasonmerino/react-native-simple-store - this is a library on top
of AsyncStorage that may be interesting to save our offline work. It's described as
"A minimalistic wrapper around React Native's AsyncStorage." 

--- OR ---

Redux Persist has this NASTY bug in dealing with database changes (i.e. when the structure 
of the state changes) That's why they created the "redux-persist-migrate" module.  
There is also "redux-persist-transform-compress"
and "redux-persist-transform-filter" - need to investigate for more info

-----------------------------------------------------------------------------------
 REDUX PERSIST (Local Storage) EXAMPLE
-----------------------------------------------------------------------------------

http://www.reactnativeexpress.com/redux_persist

With redux-persist this can be done with a blacklist option:

persistStore(store, {
  blacklist: ['nav'],
  storage: AsyncStorage
});

-----------------------------------------------------------------------------------
 REDUX FULL (Cloud Storage) EXAMPLE
-----------------------------------------------------------------------------------

http://www.reactnativeexpress.com/react_redux

Example File: (emojisRedux.js)

// The types of actions that you can dispatch to modify the state of the store
export const emojis = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
}

// Helper functions to dispatch actions, optionally with payloads
export const actionCreators = {
  add: (item) => {
    return {type: emojis.ADD, payload: item}
  },
  remove: (index) => {
    return {type: emojis.REMOVE, payload: index}
  }
}

// Initial state of the store
const initialState = {
  todos: ['Click to remove', 'Learn React Native', 'Write Code', 'Ship App'],
}

// Function to handle actions and update the state of the store.
// Notes:
// - The reducer must return a new state object. It must never modify
//   the state object. State objects should be treated as immutable.
// - We set \`state\` to our \`initialState\` by default. Redux will
//   call reducer() with no state on startup, and we are expected to
//   return the initial state of the app in this case.
export const reducer = (state = initialState, action) => {
  const {todos} = state
  const {type, payload} = action

  switch (type) {
    case emojis.ADD: {
      return {
        ...state,
        todos: [payload, ...todos],
      }
    }
    case emojis.REMOVE: {
      return {
        ...state,
        todos: todos.filter((todo, i) => i !== payload),
      }
    }
  }

  return state
}

-----------------------------------------------------------------------------------

You can serialize any object with any types inside to json-string with "JSON.stringify" 
and save with AsyncStorage. Loading should be easy too - load as string, deserialize 
with "JSON.parse" to object instance with any types inside.

-----------------------------------------------------------------------------------

https://medium.com/the-react-native-log/a-mini-course-on-react-native-flexbox-2832a1ccc6

Use PixelRatio to make a perfect circle when using border radius.

-----------------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Arial',

    ...Platform.select({ 
      ios: { color: '#333' },
      android: { color: '#ccc' },
    }),
    shadowColor: '#ccc',
    shadowOffset: { width: 2, height: 2, },
    shadowOpacity: 0.5,
    shadowRadius: 3,

  },
});

-----------------------------------------------------------------------------------

*/
