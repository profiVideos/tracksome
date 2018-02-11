import React from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Alert,
  Image,
  Modal,
  FlatList,
  //TextInput,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  TouchableHighlight,
} from 'react-native';

import {
  MenuProvider
} from 'react-native-popup-menu';
import { UniqueId } from '../components/common/UniqueId';
import AppColors from '../templates/appColors';
import NoteSplash from '../images/Note-Splash.png';
import NoteDisplay from '../components/NoteDisplay';
import NoteEdit from '../components/NoteEdit';
import {
  addNote,
  clearNote,
  clearCard,
  addCardNote,
  //updateNote,
  deleteNote,
  //currentNote,
  highlightNote,
  openNotesModal,
  closeNotesModal,
  setNoteSelected,
  updateCardNotes,
  toggleColorPicker,
  propertyNoteChanged
} from '../store/actions';
import store from '../store';

/*
const AppColors = {
  paperColor: '#e2e2e2',      // ... off white ...
  hiliteColor: '#fff8b2',     // ... light yellow ...
  accentColor: '#dea140',     // ... medium orange ...
  mainLiteColor: '#a32b26',   // ... medium red ...
  mainDarkColor: '#590d0b',   // ... dark red (burgundy) ...
  darkerColor: '#325a66'      // ... dark cyan ....
*/

/*

NEW:***********************************************************************

My First Realm Cloud Instance;
https://tracksome-live.us1.cloud.realm.io/

NEW:***********************************************************************

*/

const notesLiveResults = store.getAllNotes();     // ... Realm updates this in real time ...

const whatDoYouNeed = state => {
  return {
    saveMode: state.login.saveMode,
    editNote: state.notes.editNote,
    noteList: notesLiveResults,
    thisNote: state.notes.thisNote,
    thisCard: state.cards.thisCard,
    colorPicker: state.notes.colorPicker,
    highlighted: state.notes.highlighted, 
    notesUpdated: state.notes.lastUpdated,
    notesChanged: state.cards.notesChanged,
    notesModalOpen: state.notes.notesWindowOpen
  };
};

class ShowNotes extends React.PureComponent {
  static navigatorStyle = {
    drawUnderNavBar: false,
    screenBackgroundColor: AppColors.paperColor,
    navBarBackgroundColor: AppColors.accentColor,
    navBarTranslucent: false
  };

  /*
  static navigatorButtons = {
    fab: {
      collapsedId: 'share',
      collapsedIcon: { ' + ' },   //require('../../img/ic_share.png'),
      collapsedIconColor: 'red', // optional
      backgroundColor: AppColors.darkerColor //'#607D8B'
    }
  };
  */

  constructor(props) {
    super(props);
    this.onNoteItemPress = this.onNoteItemPress.bind(this);
    this.onNoteItemToggle = this.onNoteItemToggle.bind(this);
    this.onNoteItemMenuPress = this.onNoteItemMenuPress.bind(this);
    this.state = {
      canClose: false
      //title: '',
      //note: '',
      //infoWidth: Dimensions.get('window').width - 112
    };
  }

  componentWillMount() {
    console.log('inside show notes ...');
  }

  componentWillReceiveProps(nextProps) {
    //-------------------------------------------------------------------------------------
    // ... due to the async processing we can only save when everything has been added ...
    // ... if main if is true - the tags Modal window has now closed - save & clean up ...
    //-------------------------------------------------------------------------------------
    if (this.props.notesModalOpen && nextProps.notesModalOpen === false) {
      if (nextProps.notesChanged === true && this.props.thisCard.key !== '') {   
        this.props.dispatch(updateCardNotes(this.props.thisCard.key, nextProps.thisCard.notes));
      }
      this.props.dispatch(clearNote());  // ... removes the card link from note record ...
      this.props.dispatch(clearCard());
    }
  }

  onNoteItemPress(key) {
    console.log('The main item was pressed with this key: ', key);
    // ... if item was already selected - and user presses again - deselect ...
    if (this.props.highlighted === key) {
      this.props.dispatch(highlightNote(''));
    } else this.props.dispatch(highlightNote(key));
  }

  onNoteItemToggle(key, selected) {
    this.props.dispatch(setNoteSelected(key, selected));
  }

  onNoteItemMenuPress(option, item) {
    switch (option) {
      case 'edit': {
        ToastAndroid.show('Edit Info', ToastAndroid.LONG);
        //console.log('Tags was selected for item key ', item.key);
        //this.props.dispatch(currentNote(item));
        //this.props.dispatch(openNotesModal(item.key));
        break;
      }
      case 'delete': {
        Alert.alert('Delete Note', 
          'You are about to remove this item.\nDo you really want to do this?',
          [{ text: 'Cancel', style: 'cancel' },
           { text: 'OK', onPress: () => this.props.dispatch(deleteNote(item.key)) }]);
        break;
      }
      default: break;
    }  // ... switch ...
  }

  openNoteEditModal() {
    this.props.dispatch(openNotesModal(''));
  }

/*
      if (this.props.thisNote.title === '') {
        Alert.alert('Adding Note', 
          `You are about to add a note without a title.
Do you really want to do this?\n
If you DO NOT wish to use note titles, please turn them off in the options panel.`,
          [{ text: 'Cancel', style: 'cancel' },
           { text: 'OK', onPress: () => this.addOrUpdateNote(card, true) }]);
      } else {
        // ... just save the note ...
        this.addOrUpdateNote(card, true);
      }

*/

  closeNoteEditModal(card) {
    if (this.props.thisNote.note !== '') {
      // ... user closed without hitting the plus '+' button first (can happen!) ...
      this.addNote2Card(card, true);  // ... true = we are finished ...
    } else {
      // ... nothing entered except maybe an orphan title - just close ...
      this.props.dispatch(closeNotesModal(''));
    }
  }

  noteTitleChanged(text) {
    this.props.dispatch(propertyNoteChanged('title', text));
  }

  noteBodyChanged(text) {
    this.props.dispatch(propertyNoteChanged('note', text));
  }

  noteColorChanged(color) {
    this.props.dispatch(propertyNoteChanged('color', color));
  }

  buttonPressed() {
    this.props.dispatch(toggleColorPicker(this.props.colorPicker));
  }

  addOrUpdateNote(card, canClose) {
    if (this.props.thisNote.key === '') {
      const newNoteKey = UniqueId();
      this.props.dispatch(addNote(
        newNoteKey,
        this.props.thisNote.card,
        this.props.thisNote.icon, 
        this.props.thisNote.title, 
        this.props.thisNote.note, 
        this.props.thisNote.color, 
        this.props.thisNote.priority, 
        this.props.thisNote.reminder
      ));
      // ... if we are editing an existing card, we need ...
      // ... to update the card with this new note link ...
      if (card !== '') {
        this.props.dispatch(addCardNote(newNoteKey));
      }
    } else {
      // ... update this note ...
      // ... the key is not being added or deleted from the card so all's good ...
    }
    if (canClose) {
      this.props.dispatch(closeNotesModal(''));
      ToastAndroid.show(`Saving Note with Card: ${card}`, ToastAndroid.SHORT);
    }
  }

  addNote2Card(card, canClose) {
    if (this.props.thisNote.note !== '') {
      if (this.props.thisNote.title === '') {
        Alert.alert('Adding Note', 
          `You are about to add a note without a title.
Do you really want to do this?\n
If you DO NOT wish to use note titles, please turn them off in the options panel.`,
          [{ text: 'Cancel', style: 'cancel' },
           { text: 'OK', onPress: () => this.addOrUpdateNote(card, canClose) }]);
      } else {
        // ... just save the note ...
        this.addOrUpdateNote(card, canClose);
      }
    }
  }

  changeColor(color) {
    ToastAndroid.show(`Changing Color to ${color}`, ToastAndroid.LONG);
  }

  showWelcome() {
    const plusSymbol = ' +  ';
    return (
      <View style={styles.bannerContainer}>
        <Text style={styles.bannerText}>
          Your list is ready for your first note ...
        </Text>
        <Image style={styles.imageStyle} source={NoteSplash} />
        <Text style={styles.bannerText}>
          Press the <Text style={styles.boldText}>{plusSymbol}</Text>
          symbol to get started!
        </Text>
      </View>
    );
  }

  itemSeparator = () => {
    return (<View style={styles.separatorStyle} />);
  };

  showMainList() {
    return (
      <FlatList
        keyboardShouldPersistTaps='always'
        //style={{ marginRight: 5 }}
        data={this.props.noteList}
        extraData={this.props.notesUpdated}
        renderItem={this.renderNoteDisplay}
        ItemSeparatorComponent={this.itemSeparator}
      />
    );
  }

  renderNoteEditScreeeeeeeeeeen() {
    //if (this.props.notesModalOpen) {
      this.props.navigator.showLightBox({
       screen: 'tracksome.BuildCard', // unique ID registered with Navigation.registerScreen
       passProps: {}, // serializable object that will pass as props to the lightbox (optional)
       style: {
         backgroundBlur: 'dark', // 'dark' / 'light' / 'xlight' / 'none' - the type of blur 
         //on the background
         backgroundColor: '#ff000080' // tint color for the background, 
         //you can specify alpha here (optional)
       },
       adjustSoftInput: 'resize', // android only, adjust soft input, 
       //modes: 'nothing', 'pan', 'resize', 'unspecified' (optional, default 'unspecified')
      });
    //}
  }

  renderNoteEditScreen() {
    //if (this.props.editNote === '') return;
    return (
      <View style={styles.popupContainer}>
        <Modal
            visible={this.props.notesModalOpen}
            transparent
            animationType={'fade'}
        >
          <View style={styles.modalContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollStyle}
              keyboardShouldPersistTaps='always'
            >
              <View style={styles.modalInnerContainer}>
                <NoteEdit
                  note={this.props.thisNote.note}
                  card={this.props.thisNote.card}
                  noteTitle={this.props.thisNote.title}
                  noteColor={this.props.thisNote.color !== '' ? 
                    this.props.thisNote.color : '#f8f8f8'}
                  pickerActive={this.props.colorPicker}
                  onNoteAdd={() => this.addNote2Card(this.props.thisNote.card, false)}
                  onButtonPress={() => this.buttonPressed()}
                  onNoteChange={text => this.noteBodyChanged(text)}
                  onColorChange={color => this.noteColorChanged(color)}
                  onTitleChange={title => this.noteTitleChanged(title)}
                  onClosePress={() => this.closeNoteEditModal(this.props.thisNote.card)} 
                />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

/*
  renderCatDescription(category) {
    const indexPos = this.findCategoryByKey(category);
    if (indexPos >= 0) {
      return `${this.props.catList[indexPos].icon} ${this.props.catList[indexPos].name}`;
    }
    return category;
  }
          (item.color !== '' ? 'white' : 'grey')}

const elapsedTime = () => {
  'use strict';
  const since   = 1491685200000, // Saturday, 08-Apr-17 21:00:00 UTC
        elapsed = (new Date().getTime() - since) / 1000;

  if (elapsed >= 0) {
    const diff = {};

    diff.days    = Math.floor(elapsed / 86400);
    diff.hours   = Math.floor(elapsed / 3600 % 24);
    diff.minutes = Math.floor(elapsed / 60 % 60);
    diff.seconds = Math.floor(elapsed % 60);

    let message = `Over ${diff.days}d ${diff.hours}h ${diff.minutes}m ${diff.seconds}s.`;
    message = message.replace(/(?:0. )+/, '');
    alert(message);
  }
  else {
    alert('Elapsed time lesser than 0, i.e. specified datetime is still in the future.');
  }
};

document.getElementById('counter').addEventListener('click', elapsedTime, false);

*/

  renderMainScreen() {
    return (this.props.noteList.length === 0 ? this.showWelcome() : this.showMainList());
    //return (this.showWelcome());
  }

  renderNoteDisplay = ({ item }) => {
    const noteColor = (item.color !== '' ? item.color : '#f8f8f8');
    return (
      <NoteDisplay
        item={item}
        paperColor={noteColor}
        marked={item.key === this.props.highlighted}
        //numTags={this.countTags(item.tags)}
        //catDesc={this.renderCatDescription(item.category)}
        checkIcon={item.selected ? 'check-square-o' : 'square-o'}
        hilite={item.key === this.props.highlighted ? AppColors.hiliteColor : noteColor} 
        onPressItem={this.onNoteItemPress}      // ... used to highlight an item ...
        onToggleItem={this.onNoteItemToggle}    // ... turns the checked status on/off ...
        onMenuPress={this.onNoteItemMenuPress}
      />
    );
  }


/*        
*/

  render() {
    return (
      <MenuProvider>
        <View style={styles.outerContainer}>
          { this.renderMainScreen() }
          { this.renderNoteEditScreen() }
        </View>
        <TouchableHighlight 
          style={styles.addButton}
          underlayColor='#999' 
          onPress={() => { this.openNoteEditModal(); }} 
        >
          <Text style={{ fontSize: 36, color: 'white', paddingBottom: 3 }}>+</Text>
        </TouchableHighlight>
      </MenuProvider>
    );
  }

}

export default connect(whatDoYouNeed)(ShowNotes);

/*
          <View>
            <TouchableHighlight 
              style={styles.addButton}
              underlayColor='#ff7043' onPress={() => { console.log('pressed'); }} 
            >
                <Text style={{ fontSize: 40, color: 'white' }}>+</Text>
            </TouchableHighlight>
          </View>          

          <TouchableOpacity 
            activeOpacity={0.5} 
            onPress={this.SampleFunction} 
            style={styles.TouchableOpacityStyle} 
          >
          <Image 
            source={{ uri: 'https://reactnativecode.com/wp-content/uploads/2017/11/Floating_Button.png' }} 
            style={styles.FloatingButtonStyle} 
          />
          </TouchableOpacity>

Pfeffenhausen Rathaus          
Dienstag 13:30 – 16:00 Uhr
Donnerstag 13:30 – 18:00 Uhr

*/

const styles = StyleSheet.create({
  scrollStyle: {
    //width: '100%'
  },
  popupContainer: {
    flex: 1,
    //width: '100%',
    //justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    //width: '100%',
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  modalInnerContainer: {
    flex: 1,
    //width: '100%',
    //height: '100%',
    //backgroundColor: '#f8f8f8',
    //justifyContent: 'center',
  },
  FloatingButtonStyle: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
  },
  TouchableOpacityStyle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 25,
    bottom: 10,
  },
  addButton: {
    elevation: 5,
    backgroundColor: AppColors.darkerColor,
    borderColor: '#aaa',
    borderWidth: 1,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 18,
    right: 22,
    shadowColor: '#000000',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0
    }
  },  
  separatorStyle: {
    //backgroundColor: 'rgba(0,0,0,0.85)',
    //backgroundColor: 'white',
    margin: 2,
    //width: '85%',
    //alignSelf: 'center',
    //height: 1
  },
  listContainer: {
    //elevation: 2,
    //marginBottom: 10,
    //paddingBottom: 12,
    //shadowColor: '#121212',
    //shadowOffset: { width: 1, height: 3 },
    //shadowOpacity: 0.85,
    //backgroundColor: 'yellow'
  },
  bannerContainer: {
    height: '100%',
    padding: 35,
    alignItems: 'center',
    justifyContent: 'center'
  },
  boldText: {
    fontSize: 22,
    color: 'black',
    fontWeight: '700'
  },
  bannerText: {
    color: 'rgba(0,0,0,0.45)',
    fontSize: 18,
    padding: 20,
    textAlign: 'center'
  },
  imageStyle: {
    height: 150,
    width: 150,
    opacity: 0.35,
    resizeMode: 'contain'
  },
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    //marginRight: 10,
    //marginBottom: 5,
    //paddingBottom: 5,
    shadowColor: '#121212',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.85,
  },
  standardText: {
    color: '#333',
    margin: 20,
    textAlign: 'center'
  }
});
