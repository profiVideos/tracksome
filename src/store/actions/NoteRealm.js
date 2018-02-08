import { tsRealm } from '../data/tsObjects';
import { UniqueId } from '../../components/common/UniqueId';

// ... Realm supports the following basic types: bool, int, float, double, string, data, and date.
// ... Each property has a name and is described by either a string containing the property’s type, 
// ... or an object with name, type, objectType, optional, default, and indexed fields.

/*

NEW:***********************************************************************

My First Realm Cloud Instance;
https://tracksome-live.us1.cloud.realm.io/

NEW:***********************************************************************

*/

export const getAllNotes = () => {
  const noteList = tsRealm.objects('Note').sorted('updatedTimestamp', true);  
  return noteList;
};

/*
// ... proper way to write values ...
try {
  realm.write(() => {
    realm.create('Car', {make: 'Honda', model: 'Accord', drive: 'awd'});
  });
} catch (e) {
  console.log("Error on creation");
}
*/

export const getNote = (key) => {
  const thisItem = tsRealm.objectForPrimaryKey('Note', key);
  return thisItem;
};

export const createNote = (cIcon, cTitle, cNote, cColor, cPriority, cReminder) => {
  tsRealm.write(() => {
    tsRealm.create('Note', {
      key: UniqueId(),
      icon: cIcon,
      title: cTitle,
      note: cNote,
      color: cColor,
      priority: cPriority,
      reminder: cReminder,
      selected: false,
      createdTimestamp: new Date(),
      updatedTimestamp: new Date()
    });
  });
};

export const updateNoteSelected = (key, isSelected) => {
  tsRealm.write(() => {
    // ... update this note based on the key ...
    tsRealm.create('Note', { key, selected: isSelected }, true);
  });
};

export const updateNote = (key, icon, title, note, color, priority, reminder) => {
  tsRealm.write(() => {
    // ... update this card based on the key ...
    tsRealm.create('Note', { 
      key, 
      icon, 
      title, 
      color, 
      priority, 
      reminder,
      updatedTimestamp: new Date()
    }, true);
  });
};

//-----------------------------------------------------------------------------
// ... we should really do this within a transaction so we could roll back ...
//-----------------------------------------------------------------------------
export const deleteNote = (key) => {
  tsRealm.write(() => {
    const queryResult = tsRealm.objectForPrimaryKey('Note', key);
    if (queryResult !== undefined) {
      tsRealm.delete(queryResult);
    }
  });
};

export const deleteSelectedNotes = () => {
  tsRealm.write(() => {
    const allSelected = tsRealm.objects('Note').filtered('selected = true');
    tsRealm.delete(allSelected);
  });
};

// ... not really needed as the update function could handle this ...
/*
export const updateNoteColor = (key, newColor) => {
  tsRealm.write(() => {
    // ... update this note based on the key ...
    tsRealm.create('Note', { key, color: newColor }, true);
  });
};
*/
