import React, { PureComponent } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Alert,
  Picker,
  StyleSheet, 
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
  TouchableNativeFeedback 
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-crop-picker';
import { MenuProvider } from 'react-native-popup-menu';
import { ScreenVisibilityListener as RNNScreenVisibilityListener } from 'react-native-navigation';
//import MDInput from '../components/common/mdInput';
import { TextField } from 'react-native-material-textfield';
import AppColors from '../templates/appColors';
import CardDisplay from '../components/CardDisplay';
import RenderTags from '../components/RenderTags';
import RenderCheckedBadge from '../components/DropsUtility';
import PictureFrame from '../images/PictureFrame.png';
import ItemTags from '../images/ItemTags.png';
import ItemNotes from '../images/ItemNotes.png';
import SmileyFace from '../images/SmileyGlasses.png';
import PhotoAdd from '../images/PhotoAdd.png';
//import ListEdits from '../images/ListEdit.png';

import { 
  addCard,
  //clearNote,
  updateCard,
  addCardTag,
  addCardImage,
  openTagsModal,
  deleteCardTag,
  //openNotesModal,
  closeTagsModal,
  //closeNotesModal,
  itemCardChanged,
} from '../store/actions';
import store from '../store';

let catListLive = store.getCategories('');

// location of Java runtime - U:\AppDev\Android\Android Studio\jre

const whatDoYouNeed = state => {
  return {
    emojiCode: state.emojis.emojiCode,     // ... current emoji selected in PickEmojis ...
    thisCard: state.cards.thisCard,
    activeList: state.lists.activeList,
    somethingChanged: state.cards.cardChanged,
    tagsModalOpen: state.cards.tagsWindowOpen
  };
};

class BuildCard extends PureComponent {
  static navigatorStyle = {
    drawUnderNavBar: false,
    disabledButtonColor: '#333',
    screenBackgroundColor: AppColors.paperColor,
    navBarButtonColor: AppColors.hiliteColor,
    navBarTextColor: AppColors.accentColor,
    navBarBackgroundColor: AppColors.mainDarkColor,
    navBarTranslucent: false
  };

  constructor(props) {
    super(props);
    this.inputs = {};
    this.onSelectEmoji = this.onSelectEmoji.bind(this);
    this.doSomeFunction = this.doSomeFunction.bind(this);
    this.updateThisCard = this.updateThisCard.bind(this);
    this.openTagsEditModal = this.openTagsEditModal.bind(this);
    this.listener = new RNNScreenVisibilityListener({
      didDisappear: ({ screen /*, startTime, endTime, commandType*/ }) => {
        if (screen === 'tracksome.EditCategories') {
          // ... in case a new category was added or removed, rebuild the picker list ...
          this.buildPickerItems(catListLive);
          //ToastAndroid.show( 
          //  `Screen ${screen} was open for ${endTime - startTime} ms after [${commandType}]`,
          //   ToastAndroid.LONG);
        }
      }
    });    
    this.state = {
      image: null,
      images: null,
      pickerItems: [],
      getIcon4Card: false,
      // ... these should go in redux / options panel & config file ...
      compress: 0.30,   // ... could cause huge files if above 50% ...
      showIcon: true,
      showName: true,
      showCategory: true,
      showDesc: true,
      showTags: true,
      showRating: true,
      showListPreview: false,
    };
  }

/*
      tags: [
        'Squirting',
        'Blowjob',
        'Sweet Gash',
        'Ass Fuck',
        'Cum Swapping',
        'Doggy Style',
        'Cow Girl',
        'Deepthroat',
        'Big Boobs',
        'Shaved Pussy',
        'Massive Cock'
      ]
*/

  componentWillMount() {
    console.log('inside build cards ...');
    const scrTitle = (this.props.id === '' ? 'Add a New Drop' : 'Edit Drop');
    this.props.navigator.setTitle({ title: scrTitle });
    this.listener.register();
    //this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.cleanTempSpace();  // ... cleans up images in tmp directory ...
    //ToastAndroid.show(`catListLive: ${this.props.activeList.key}`, ToastAndroid.LONG);
    catListLive = store.getCategories(this.props.activeList.key);
    if (catListLive !== undefined) {
      //ToastAndroid.show(`catListLive: ${JSON.stringify(catListLive)}`, ToastAndroid.LONG);
      this.buildPickerItems(catListLive);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.emojiCode !== nextProps.emojiCode) {
      if (this.state.getIcon4Card) {
        this.props.dispatch(itemCardChanged('icon', nextProps.emojiCode));
        this.props.dispatch(itemCardChanged('iconType', 'ICO'));
      }
      // ... clean up and go home ...
      this.setState({ getIcon4Card: false });
      //console.log('A new Emoji Code was selected');
    }
    //this.displaySnackBarMsg('Your details have been saved.', 'Great Job');
  }

  componentWillUnmount() {
    if (this.props.somethingChanged) this.updateThisCard();
    if (this.listener) {
      this.listener.unregister();
      this.listener = null;
    }
  }

/*
  onNavigatorEvent(event) {
    ToastAndroid.show(`New Navigator Event: ${event.type}`, ToastAndroid.SHORT);
    if (event.type === 'ScreenChangedEvent') {
      ToastAndroid.show(`Screen Changed: ${event.id}`, ToastAndroid.SHORT);
    }
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
        case 'menu': {
          this.props.navigator.toggleDrawer({ side: 'left', animated: true });
          break;
        }
        case 'options': {
          console.log('pressed the options icon');
          break;
        }
        default: break;
      }
    }
  }
*/

  onChangeSelection(selection) {
    if (selection === 'addCategory') {
      //console.log('Wants to add a category!');
      this.props.navigator.showModal({
        title: 'Add a new Category',
        screen: 'tracksome.EditCategories'
      });
    } else /*if (selection !== '') */ {
      //ToastAndroid.show(`New Category: ${selection}`, ToastAndroid.LONG);
      this.props.dispatch(itemCardChanged('category', selection));
    }
  }

  onBuildCardClose() {
    //console.log('Should close this window!');
    this.props.onClosePress();
  }   

  onSelectEmoji() {
    this.setState({ getIcon4Card: true });
    this.props.navigator.showModal({
       title: 'Select an Emoji', 
      screen: 'tracksome.EmojiPicker' 
    });
  }

  getCameraImage(cropit) {
    ImagePicker.openCamera({
      width: 1056,
      height: 768,
      cropping: cropit,
      compressImageQuality: this.state.compress,
      includeExif: true,
      includeBase64: true,
      cropperToolbarColor: AppColors.mainDarkColor,
      cropperActiveWidgetColor: AppColors.mainLiteColor,
      cropperToolbarTitle: 'Position Photo',
    }).then(image => {
      console.log('received image', image);
      this.itemImageChanged(image);
    }).catch(e => {
      console.log(e);
      //Alert.alert(e.message ? e.message : e);
    });
  }

  setIconType(mode) {
    this.props.dispatch(itemCardChanged('iconType', mode));
  }
  
  itemNameChanged(text) {
    this.props.dispatch(itemCardChanged('name', text));
  }

  itemDescChanged(text) {
    this.props.dispatch(itemCardChanged('desc', text));
  }

  itemImageChanged(image) {
    //console.log('New Image: ', image);
    this.props.dispatch(addCardImage(image));
    this.props.dispatch(itemCardChanged('iconType', 'PHO'));
    // ... MG - 01-03-2018 - makes sure we don't leave junk all over the Pictures folder ...
    ImagePicker.cleanSingle(image.path);  // ... use this to remove temp compressed file ...
  }

  itemTagRemove(tag) {
    this.props.dispatch(deleteCardTag(tag));
  }

  displaySnackBarMsg(msg, action) {
    this.props.navigator.showSnackbar({
      text: msg,  //'This option is in development',
      actionText: action, // optional
      actionId: 'rollback',  // ... ActionId within the Navigator Events ...
      actionColor: 'white', // optional
      textColor: AppColors.accentColor, // optional
      backgroundColor: '#333', // optional
      duration: 'long' // default is `short`. Available options: short, long, indefinite
    });
  }

  openTagsEditModal() {
    this.props.dispatch(openTagsModal(this.props.thisCard.key));
  }

  closeTagsEditModal() {
    if (this.props.thisCard.tag !== '') {
      this.addTag2Card();   // ... user closed without hitting the plus '+' button ...
    }
    this.props.dispatch(closeTagsModal(''));
  }

  cleanTempSpace() {
    //ImagePicker.cleanSingle(path);  // ... use this to remove temp file ...
    ImagePicker.clean().then(() => {
      console.log('removed all tmp images from tmp directory');
    }).catch(e => {
      Alert.alert(e);
    });
  }

  pickSingleImage(cropit, circular = false) {
    //console.log('About to select a photo');
    ImagePicker.openPicker({
      width: 1056,
      height: 768,
      mediaType: 'photo',
      cropping: cropit,
      writeTempFile: false,          // ... only works on IOS ...
      freeStyleCropEnabled: true,   // ... only works on Android ...
      //multiple: true,
      //circular: true,
      cropperCircleOverlay: circular,
      //compressImageMaxWidth: 1056,
      //compressImageMaxHeight: 768,
      compressImageQuality: this.state.compress,
      //compressVideoPreset: 'MediumQuality',
      includeExif: false, //true,
      includeBase64: true,
      cropperToolbarColor: AppColors.mainDarkColor,
      cropperActiveWidgetColor: AppColors.mainLiteColor,
      //cropperStatusBarColor: 'transparent',
      //hideBottomControls: true,
      //showCropGuidelines: false,
      cropperToolbarTitle: 'Position Photo',
    }).then(image => {
      //console.log('received image', image);
      this.itemImageChanged(image);
    }).catch(e => {
      console.log(e);
      //Alert.alert(e.message ? e.message : e);
    });
  }

  itemTagChanged(text) {
    //console.log('New Tag Value: ', text);
    this.props.dispatch(itemCardChanged('tag', text));
  }

  processTag(tag) {
    console.log('This tag is = ', tag);
    // ... don't add empty tags please ...
    // ... if not already in the list for this card - add it ...
    this.props.dispatch(addCardTag(tag));
    // ... also consider adding this tag to the master tags list ...
    // ... naturally after checking for duplicates ...
  }

  addTag2Card() {
    //console.log('Inside Add Tag 2 Card: ', this.props.thisCard.tag);
    if (this.props.thisCard.tag !== '') {
      const tagParts = this.props.thisCard.tag.split(',');  // ... in case commas entered ...
      tagParts.map(tag => this.processTag(tag.trim()));
    }
  }

  updateThisCard() {
    // ... we have to have a card name in order to save ...
    if (this.props.thisCard.name !== '') {
      if (this.props.thisCard.key === '') {
        // ... we are adding a new card ...
        this.props.dispatch(addCard(
          // ... our card's unique key is assigned in Realm - createCard ...
          this.props.activeList.key,  // ... link this card to our active list ...
          this.props.thisCard.name,
          this.props.thisCard.desc,
          this.props.thisCard.icon,
          this.props.thisCard.iconType,
          this.props.thisCard.rating,
          this.props.thisCard.category,
          this.props.thisCard.imageThumb,
          this.props.thisCard.mimeType,
          this.props.thisCard.barcode,
          this.props.thisCard.tags,
          this.props.thisCard.notes
        ));
        this.inputs.name.focus();
      } else {
        // ... we should update this card ...
        this.props.dispatch(updateCard(
          this.props.thisCard.key,
          this.props.thisCard.list,
          this.props.thisCard.name,
          this.props.thisCard.desc,
          this.props.thisCard.icon,
          this.props.thisCard.iconType,
          this.props.thisCard.rating,
          this.props.thisCard.category,
          this.props.thisCard.imageThumb,
          this.props.thisCard.mimeType,
          this.props.thisCard.barcode,
          this.props.thisCard.tags,
          this.props.thisCard.notes
        ));
        // ... on an update auto close the modal window ...
        this.props.onClosePress();
      }
    }
  }

  doSomeFunction() {
    console.log('About to do something');
    //this.props.navigator.dismissLightBox();
    //Alert.alert('About to do something');
    /*
    this.props.navigator.setSubTitle({
      subtitle: 'Connecting...'
    });
    this.props.navigator.toggleTabs({
      to: 'hidden',
      animated: true
    });
    */
  }

  buildPickerItems(items) {
    const catsList = items.map((item, index) => {
      return (
        <Picker.Item 
          key={index} 
          label={`${item.icon}  ${item.name}`} 
          value={`${item.icon}  ${item.name}`} 
        />
      );
    });
    this.setState({ pickerItems: catsList }); 
  }

  countTags(tags) {
    return tags.length;
  }

  renderImage(image, mimeType) {
    //return <Image style={styles.imageStyle} source={image} />;
    return (
      <Image 
        style={styles.imageStyle} 
        source={{ uri: `data:${mimeType};base64,${image}` }} 
      />
    );
  }

  renderNotesAddIcon() {
    if (this.props.id === '') return;   // ... can't add notes during card add (no card key) ...
    return (
      <TouchableNativeFeedback 
        onPress={() => this.props.openNoteEditModal('', this.props.thisCard)}
      >
        <View style={styles.iconsPadding}>
          <Image style={styles.imageIconStyle} source={ItemNotes} />
        </View>
      </TouchableNativeFeedback>
    );
  }

  renderActionIcons = () => (
    <View style={styles.actionBar}>
      <TouchableNativeFeedback onPress={this.onSelectEmoji}>
        <View style={styles.iconsPadding}>
          <Image style={styles.imageIconStyle} source={SmileyFace} />
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback onPress={() => this.pickSingleImage(true)}>
        <View style={styles.iconsPadding}>
          <Image style={styles.imageIconStyle} source={PictureFrame} />
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback onPress={() => this.getCameraImage(true)}>
        <View style={styles.iconsPadding}>
          <Image style={styles.imageIconStyle} source={PhotoAdd} />
        </View>
      </TouchableNativeFeedback>
      { this.renderNotesAddIcon() }
      <TouchableNativeFeedback onPress={this.openTagsEditModal}>
        <View style={styles.iconsPadding}>
          <Image style={styles.imageIconStyle} source={ItemTags} />
        </View>
      </TouchableNativeFeedback>
    </View>
  );

  renderNameInput() {
    if (this.state.showName === false) return;
    return (
      <View style={styles.nameWidth}>
        <TextField
          //style={styles.nameInput}
          //autoFocus={this.props.id === ''}    // ... only autofocus on add ...
          label='Drop Name*'
          title='Please enter a name for this photo drop.'
          lineWidth={0.75}
          labelHeight={20}
          animationDuration={375}
          inputContainerPadding={6}
          ref={input => { this.inputs.name = input; }}
          titleTextStyle={{ fontStyle: 'italic', marginTop: -2 }}
          //enablesReturnKeyAutomatically
          //characterRestriction={32}
          returnKeyType='next'
          disableFullscreenUI
          onSubmitEditing={() => { this.inputs.desc.focus(); }}
          value={this.props.thisCard.name}
          onChangeText={text => this.itemNameChanged(text)}
        />
      </View>
    );
  }

  renderDescription() {
    if (this.state.showDesc === false) return;
    return (
      <View style={styles.inputStyle}>
        <TextField
          //style={styles.descInput}
          multiline
          label='Description (optional)'
          title='Briefly describe what this drop is about ... '
          lineWidth={0.75}
          labelHeight={14}
          animationDuration={375}
          inputContainerPadding={6}
          multiline
          ref={input => { this.inputs.desc = input; }}
          titleTextStyle={{ fontStyle: 'italic', marginTop: -2 }}
          disableFullscreenUI
          returnKeyType='next'
          //onSubmitEditing={() => { this.inputs.cat.focus(); }}
          value={this.props.thisCard.desc}
          onChangeText={text => this.itemDescChanged(text)}
        />
      </View>
    );
  }

  /*

  this should help deal with some keybpoard issues;
  https://medium.freecodecamp.org/how-to-make-your-react-native-app-respond-gracefully
  -when-the-keyboard-pops-up-7442c1535580

  */

  renderCategory() {
    if (this.state.showCategory === false) return;
    return (
      <View style={styles.pickerStyle}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.labelText}>Category</Text>
          <Picker 
            style={styles.pickerElements}
            ref={input => { this.inputs.cat = input; }}
            selectedValue={this.props.thisCard.category}
            onValueChange={(value) => this.onChangeSelection(value)}
          >
            <Picker.Item label="Please choose a category ..." value="" />
            { this.state.pickerItems }
            <Picker.Item label="+ Add a new category" value="addCategory" />
          </Picker>              
        </View>
      </View>
    );
  }

  renderTags() {
    if (this.state.showTags === false) return;
    return (
      <View style={styles.tagsBar}>
        <RenderTags 
          myTags={this.props.thisCard.tags} 
          onPressTag={tag => this.itemTagRemove(tag)} 
        />
      </View>
    );
  }
        
  renderPreview() {
    if (this.state.showListPreview === false) return;
    return (
      <MenuProvider>
      <View style={styles.previewCard}>
        <Text style={styles.cardPreviewText} >Your New Drop - Story Preview</Text>
        <CardDisplay 
          id={this.props.thisCard.key}
          icon={this.props.thisCard.icon}
          name={this.props.thisCard.name}
          desc={this.props.thisCard.desc}
          image={this.props.thisCard.imageThumb}
          mimeType={this.props.thisCard.mimeType}
          rating={this.props.thisCard.rating}
          selected={false}
          marked={false}
          numTags={this.countTags(this.props.thisCard.tags)}
          catDesc={this.props.thisCard.category}
          checkIcon={this.props.thisCard.selected ? 'check-square-o' : 'square-o'}
          hilite={'white'}
          onPressMenu={this.doSomeFunction}
          onPressItem={this.doSomeFunction}   // ... simulate an item press ...
          onToggleItem={this.doSomeFunction}  // ... simulate a check box press ...
        />
      </View>
      </MenuProvider>
    );
  }

/*
    const renderImage = Object.keys(this.props.thisCard.image).length === 0 && 
                        this.props.thisCard.image.constructor === Object ?  
                      <Text style={styles.previewText}>Preview Here!</Text> :
                      (<View style={styles.wrapperImage}> 
                         <Image style={styles.imageThumb} source={this.props.thisCard.image} />
                       </View>);
*/

  renderSmallIcon() {
    if (this.props.thisCard.icon === '') return;
    return (
      <TouchableNativeFeedback onPress={() => this.setIconType('ICO')}>
        <View style={styles.wrapperIcon}> 
           <Text style={styles.emojiThumb}>{this.props.thisCard.icon}</Text>
           {this.props.thisCard.iconType === 'ICO' ? 
             <RenderCheckedBadge marginLeft={-10.5} marginTop={-20} /> : <View />}
        </View>
      </TouchableNativeFeedback>
    );
  }

  renderSmallImage() {
    const image = this.props.thisCard.imageThumb;
    const mimeType = this.props.thisCard.mimeType;
    if (image === '') return <Text style={styles.previewText}>Preview Here!</Text>;
    return (
      <TouchableNativeFeedback onPress={() => this.setIconType('PHO')}>
        <View style={styles.wrapperImage}> 
          <Image 
            style={styles.imageThumb} 
            source={{ uri: `data:${mimeType};base64,${image}` }} 
          />
          {this.props.thisCard.iconType === 'PHO' ? 
            <RenderCheckedBadge marginLeft={1} marginTop={-21} /> : <View />}
        </View>
      </TouchableNativeFeedback>
    );
  }

  renderItemExtras() {
    return (
      <View style={styles.mainPanel}>
        <View style={styles.statusBar}>
          { this.renderSmallIcon() }
          { this.renderSmallImage() }
        </View>
        <TouchableOpacity 
          disabled={this.props.thisCard.name === ''} 
          onPress={() => this.updateThisCard()}
          style={styles.masterButton}
        >
          <View style={styles.innerButton}>
            <Icon size={40} name='plus' color={'white'} />
            <Text style={styles.buttonText}>Save</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderMainIcon() {
    if (this.state.showIcon === false) return;
    return (
      <View style={styles.previewOutline}>
        {this.props.thisCard.iconType === 'PHO' ?  
          this.renderImage(this.props.thisCard.imageThumb, this.props.thisCard.mimeType) :
          <Text style={styles.emojiIcon}>{this.props.thisCard.icon}</Text>
        } 
      </View>
    );
  }

/*
    console.log('Has Photo: ', this.props.mimeType);
    return (
      <View style={styles.outerContainer}>

        <View style={styles.headerContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Image style={styles.imageIconStyle} source={ItemNotes} />
            <Text style={styles.headline}>{title}</Text>
          </View>
          <TouchableOpacity onPress={this.props.onClosePress}>
            <View style={{ alignSelf: 'flex-end' }}>
              <Icon size={20} name='times' color={AppColors.mainLiteColor} />
            </View>
          </TouchableOpacity>
        </View>

  ... after switch BuildCard to a ShowModal instead of ShowLightbox we no longer need header ...
          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row' }}>
              <Image style={styles.imageIconStyle} source={ListEdits} />
              <Text style={styles.headline}>{title}</Text>
            </View>
            <TouchableOpacity onPress={this.props.onClosePress}>
              <View style={{ alignSelf: 'flex-end' }}>
                <Icon size={20} name='times' color={AppColors.mainLiteColor} />
              </View>
            </TouchableOpacity>
          </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='always'>

*/

  //----------------------------------------------------
  // ... the main JSX render section for this class ...
  //----------------------------------------------------
  render() {
    return (
      <ScrollView style={{ flex: 1 }}>

        <View style={styles.cardContainer}>
          { this.renderActionIcons() }
          <View style={styles.textContainer}>
            <View style={styles.topRowStyle}>
              { this.renderMainIcon() }
              { this.renderNameInput() }
            </View>
            { this.renderDescription() }
            { this.renderCategory() }
          </View>
          { this.renderTags() }
        </View>
  
        { this.renderItemExtras() }
        { this.renderPreview() }
  
      </ScrollView>
    );
  }
}

export default connect(whatDoYouNeed)(BuildCard);

/*

WE NEED TO COMBINE THESE TWO FUNCTIONS INTO AN IMPORT MODULE
IN BUILD CARD AND SHOW CARDS

        { this.renderTagEditScreen() }

dropbox upload method

var myFile_Encoded = new encoding.TextEncoder().encode(JSON.stringify(myFile));
dbx.filesUpload({
  path: DBX_FILEPATH,
  contents: myFile_Encoded,
  mode: 'overwrite',
});

*/

const styles = StyleSheet.create({
  headline: {
    color: AppColors.accentColor,
    paddingTop: 2,
    paddingLeft: 12,
    fontSize: 18,
    fontWeight: '500',
    alignSelf: 'center'
  },
  headerContainer: {
    width: '100%',
    backgroundColor: AppColors.mainDarkColor,
    padding: 12,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardPreviewText: {
    color: AppColors.accentColor,
    fontSize: 15,
    padding: 7,
    textAlign: 'center',
    backgroundColor: AppColors.mainDarkColor
  },
  previewCard: {
    marginTop: 6,
    marginBottom: 6
  },
  wrapperIcon: {
    height: 46,
    paddingBottom: 1,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 3,
    marginRight: 12,
    borderColor: '#888',
    borderWidth: 1,
    backgroundColor: 'white'
  },
  wrapperImage: {
    height: 46,
    borderRadius: 3,
    borderColor: '#888',
    borderWidth: 1,
    backgroundColor: 'white'
  },
  mainPanel: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  innerButton: {
    paddingTop: 3,
    alignItems: 'center'
  },
  masterButton: {
    elevation: 3,
    width: 68,
    height: 68,
    marginTop: -12,
    marginLeft: -100,
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: AppColors.darkerColor,  // ... dark cyan ...
  },
  buttonText: {
    color: AppColors.hiliteColor,
    fontWeight: 'bold',
    fontSize: 10,
    marginTop: -6,
  },
  statusBar: {
    width: '100%',
    height: 50,
    marginTop: -6,
    marginLeft: -11,
    flexDirection: 'row',
    padding: 2,
    alignItems: 'center',
    backgroundColor: AppColors.accentColor,  // ... light orange ...
    justifyContent: 'center'
  },
  // ... the main icon / photo ...
  imageThumb: {
    height: 44,
    width: 60,
    borderRadius: 3,
    resizeMode: 'cover'
  },
  imageStyle: {
    height: 60,
    width: 80,
    borderRadius: 3,
    resizeMode: 'cover'
  },
  previewOutline: {
    height: 62,
    width: 82,
    //padding: 3,
    alignItems: 'center', 
    borderRadius: 5,
    marginTop: 5,
    marginRight: 8,
    marginBottom: 3,
    borderColor: '#aaa',
    borderWidth: 0.75
  },
  emojiThumb: {
    color: 'black',
    fontSize: 30,
    textAlign: 'center',
    paddingBottom: 3
  },
  emojiIcon: {
    color: 'black',
    fontSize: 42,
    textAlign: 'center',
    paddingBottom: 1
  },
  iconsPadding: {
    alignItems: 'center', 
    padding: 5
  },
  topRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  actionBar: {
    height: 46,
    flexDirection: 'row',
    paddingTop: 2,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.25)',
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#727272',
    justifyContent: 'space-around'
  },
  imageIconStyle: {
    height: 42,  //...38,
    width: 42, //...38,
    resizeMode: 'contain'
  },
  tagsBar: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    flexWrap: 'wrap',    
    width: '100%',
    alignItems: 'center'
  },
  previewText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, .5)',
    textAlign: 'center'
  },
  pickerElements: {
    marginLeft: -8,
    color: AppColors.darkerColor,
    height: 22
  },
  labelText: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, .38)',
    //color: AppColors.mainLiteColor
  },
  pickerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, .5)',
  },
  pickerStyle: {
    borderColor: '#c3c3c3',
    borderBottomWidth: 0.75,
    paddingBottom: 7
  },
  popupContainer: {
    //flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  modalInnerContainer: {
    width: '90%',
  },
  textContainer: {
    width: '90%',
    paddingTop: 4,
    paddingBottom: 10,
    shadowColor: '#121212',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.85,
    alignSelf: 'center',
    elevation: 2,
  },
  cardContainer: {
    backgroundColor: 'white',
    paddingBottom: 12,
    shadowColor: '#121212',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.85,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameWidth: {     // ... used to define the item name input width ...
    width: '72%',
    paddingTop: 3,
  },
  inputStyle: {   // ... used to define the item desc input width ...
    width: '100%'
  },
  imageContainer: {
    width: '100%',
    padding: 3,
    shadowColor: '#121212',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.85,
    elevation: 2,
    alignItems: 'center'
  },
});

/*
            <Button title="Get an Image to Crop" onPress={() => this.pickSingle(true)} />
                onValueChange={(itemValue, itemIndex) => this.setState({ language: itemValue })}
                <View style={styles.pickerElements}>
                  <Text>ICON</Text>
                  <Text style={styles.pickerText}>Markus Griebling</Text>
                  <Text style={{ position: 'absolute', marginLeft: '92%' }}>ARR</Text>
                </View>

                <TouchableNativeFeedback onPress={this.addThisCard.bind(this)}>

  renderImageStats(image) {
    //const rightNow = new Date().toLocaleString('de-DE', { hour12: false });
    const fileDate = new Date(Number(image.created)).toLocaleString('de-DE', { hour12: false });
    return (
      <View style={styles.container}>
        <Text>Path: {image.uri}</Text> 
        <Text style={styles.text}>Pixels: {image.width} x {image.height}</Text> 
        <Text style={styles.text}>Compressed @ {this.state.compress * 100}%</Text> 
        <Text style={styles.text}>Size: {image.size} bytes</Text> 
        <Text style={styles.text}>Type: {image.mimeType}</Text> 
        <Text style={styles.text}>File Created: {fileDate}</Text> 
      </View>);
  }


const { overlapContainer, avatarContainer, avatar} = styles;

    return (
        <View style={overlapContainer}>

          <View style={avatarContainer}>
            <Image style={avatar} source={{ uri: 'http://lorempixel.com/output/cats-q-c-100-100-3.jpg' }} />
          </View>

          <View style={avatarContainer}>
            <Image style={avatar} source={{ uri: 'http://lorempixel.com/output/cats-q-c-100-100-7.jpg' }} />
          </View>

          <View style={avatarContainer}>
            <Image style={avatar} source={{ uri: 'http://lorempixel.com/output/cats-q-c-100-100-3.jpg' }} />
          </View>

          <View style={avatarContainer}>
            <Image style={avatar} source={{ uri: 'http://lorempixel.com/output/cats-q-c-100-100-7.jpg' }} />
          </View>

        </View>
    );
  }
}

const styles = {
  overlapContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    marginTop: 50,
    marginRight: 50
  },
  avatarContainer: {
    borderRadius: 33,
    height: 66,
    width: 66,
    marginLeft: -15,
    borderStyle: 'solid',
    borderWidth: 3,
    borderColor: 'white'
  },
  avatar: {
    borderRadius: 30,
    height: 60,
    width: 60
  }
}

*/
