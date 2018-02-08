import React, { PureComponent } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  //Alert,
  Image,
  TextInput,
  StyleSheet,
  //ScrollView,
  TouchableOpacity,
  //TouchableHighlight,
  TouchableNativeFeedback
} from 'react-native';
//import { TextField } from 'react-native-material-textfield';
import IonIcon from 'react-native-vector-icons/Ionicons';
import AppColors from '../templates/appColors';
import ItemTags from '../images/ItemTags.png';
//import RenderTags from './RenderTags';

//const itemHeight = 65;  // ... used to calculate faster scrolls ...

/*
To Restart the currently running App;
adb shell am broadcast -a react.native.RELOAD
*/

class NoteEdit extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { 
      didSave: false,
      textValue: '' 
    };
  }

  onPressTag = (tag) => {
    console.log('Tag inside TagEdit was clicked: ', tag); 
    //this.props.onTapItem(this.props.emojiName, this.props.emojiString);
  } 

/*
  onClosePressed = () => {
    Alert.alert('Tag inside TagEdit and requested the close: ');
    this.props.onClosePress();
    //this.props.onTapItem(this.props.emojiName, this.props.emojiString);
  } 
*/

/*
  addThisTag() {
    console.log('Add this tag ...');
  }
*/
/*
  onLongPressItem = () => { 
    this.props.onLongPress(this.props.emojiKey);
  } 
      <TouchableNativeFeedback onPress={this.onPressItem} onLongPress={this.onLongPressItem}>
      </TouchableNativeFeedback>

              onTagChange={text => this.itemTagChanged(text)} 

*/

  render() {
    return (
      <View style={styles.outerContainer}>

        <View style={styles.headerContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Image style={styles.imageIconStyle} source={ItemTags} />
            <Text style={styles.headline}>Add a New Note</Text>
          </View>
          <TouchableOpacity onPress={this.props.onClosePress}>
            <View style={{ alignSelf: 'flex-end' }}>
              <Icon size={20} name='times' color={AppColors.mainLiteColor} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statusBar}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInputStyle}
              autoFocus
              //autoCorrect={false}
              blurOnSubmit={false}
              disableFullscreenUI
              underlineColorAndroid={'transparent'}
              placeholder={'Note Title ... '}
              value={this.props.tagName}
              onChangeText={this.props.onTagChange}
            />
          </View>
          <TouchableOpacity 
            //disabled={this.props.thisTag.name === ''} 
            onPress={this.props.onTagAdd} 
          >
            <View style={{ alignItems: 'center' }}>
              <Icon size={28} name='plus' color={AppColors.darkerColor} />
            </View>
          </TouchableOpacity>
          <TouchableNativeFeedback onPress={this.props.onClosePress}>
            <View style={styles.buttonFinish}> 
              <IonIcon 
                name='md-checkmark-circle-outline' 
                size={34} 
                color={AppColors.paperColor} 
              />
            </View>
          </TouchableNativeFeedback>
        </View>

        <View style={styles.noteContainer}>
          <TextInput
            style={styles.noteInputStyle}
            //autoGrow
            multiline
            //numberOfLines={4}
            //placeholder='Note Description ...'
            placeholderTextColor='#aaa'
            //returnKeyType='done'
            underlineColorAndroid={'transparent'}
            blurOnSubmit={false}
            textBreakStrategy={'highQuality'} //: enum('simple', 'highQuality', 'balanced')
            //selectionColor={getColor('paperTeal')}
            //maxHeight={250}
            disableFullscreenUI
            placeholder={'Enter something amazing ... '}
            value={this.state.textValue}
            onChangeText={(textValue) => this.setState({ textValue })}
            //onChangeText={() => this.props.onTagChange}
          />
        </View>

      </View>
    );
  }

}

export default NoteEdit;

/*
          <View style={styles.tagItem}>
            <Text style={styles.textValue}>
              Jumping Jacks
            </Text>
          </View>
          <View style={styles.tagItem}>
            <Text style={styles.textValue}>
              Elephants
            </Text>
          </View>
          <View style={styles.tagItem}>
            <Text style={styles.textValue}>
              Nursing Moms
            </Text>
          </View>

      <TouchableNativeFeedback onPress={this.onTouchablePress}>
        <View style={[styles.container, { backgroundColor: backColor }]}>
          <View style={styles.headingRow}>
            <Image 
              style={styles.imageThumb} 
              source={{ uri: this.props.thumbNail }}
            />
            <View style={styles.textMargins} >
              <Text style={styles.heading}>{this.props.Name}</Text>
              <Text style={styles.tagLine}>{this.props.Teaser}</Text>
            </View>
          </View>
        </View>
      </TouchableNativeFeedback>

  renderConversations() {
    let conversationContent = this.state.conversationArray.map((convObj, i) => {
      return <View key={i} 
      style={[globalStyle.conversationContainer,globalStyle.shadow,convObj.directionClass]}>
        <Text style= {[globalStyle.conversationText,convObj.directionTextClass]}>
        { convObj.text }</Text>
        <View style= {globalStyle.actionButtonsContainer}>
          { this.renderActionButtons(convObj.actionButtons) }
        </View>
      </View>                            
    })
    return conversationContent;
  }

*/

const styles = StyleSheet.create({
  noteContainer: {
    //flex: 1,
    //maxWidth: '100%',
    //padding: 10,
    //paddingTop: 12,
    //paddingBottom: 12,
    //flexWrap: 'wrap',
    //alignItems: 'flex-start',
    //justifyContent: 'flex-start',
    backgroundColor: '#f8f8f8',
  },
  noteInputStyle: {
    //flex: 1,
    //width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 60,
    //fontFamily: 'Lato-Regular',
    //flexWrap: 'wrap',
    //height: 'auto',
    fontSize: 15,
    textAlignVertical: 'top'    
    //width: '100%',
  },
  buttonFinish: {
    padding: 5,
    paddingLeft: 7,
    paddingRight: 7,
    backgroundColor: AppColors.darkerColor
  },
  tagsEmpty: {
    //height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    //paddingTop: 2,
    padding: 8,
    backgroundColor: AppColors.paperColor
  },
  bigMessage: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'rgba(0,0,0,0.40)'
  },
  textInputStyle: {
    color: '#121212',
    padding: 3,
    fontSize: 15,
    fontWeight: '600'
  },
  imageIconStyle: {
    height: 32,
    width: 32,
    resizeMode: 'contain'
  },
  statusBar: {
    //flex: 1,
    //width: '100%',
    elevation: 3,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.accentColor,  // ... medium orange ...
    justifyContent: 'space-around',
    shadowColor: '#121212',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  outerContainer: {
    //flex: 1,
    //width: '100%',
    borderRadius: 8,
  },
  inputContainer: {
    width: '70%',
    borderWidth: 1,
    borderColor: '#979797',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 10,
    //marginRight: 7,
    backgroundColor: 'white',
    justifyContent: 'center',
    height: 30
  },
  headline: {
    color: AppColors.accentColor,
    paddingLeft: 12,
    fontSize: 18,
    fontWeight: '500'
  },
  headerContainer: {
    //flex: 1,
    //width: '100%',
    backgroundColor: AppColors.mainDarkColor,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 12,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
});
