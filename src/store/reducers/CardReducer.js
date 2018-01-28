//import people from './people.json';

import {
  ADD_CARD,
  SORT_CARDS, 
  CLEAR_CARD,
  UPDATE_CARD,
  REMOVE_CARD,
  ADD_CARD_TAG,
  CURRENT_CARD,
  CARD_EDIT_CHANGE,
  SAVE_CARDS_SUCCESS,
  //SAVE_CARDS_FAILURE,
  LOAD_CARDS_SUCCESS,
  //LOAD_CARDS_FAILURE
  DELETE_SELECTED_CARDS
} from '../actions/actionTypes';

const initialState = {
  itemList: [],   // ... array of cards + selected flag ...
  loading: false,
  cardsDirty: false,
  detailView: false,
  thisCard: {
    key: '',
    tag: '',
    note: '',
    name: '',
    desc: '',
    icon: '',
    rating: 0,
    category: '',
    image: {},
    barcode: {},
    tags: [],
    notes: []
  }
};

const compareString = (a, b) => {
  const itemA = a.toUpperCase(); // ignore upper and lowercase
  const itemB = b.toUpperCase(); // ignore upper and lowercase
  if (itemA < itemB) return -1;
  if (itemA > itemB) return 1;
  return 0;  // ... items are equal ...
};

const CardReducer = (state = initialState, action) => {
  //console.log('Card Reducer State: ', state, '  Action: ', action);
  switch (action.type) {

    case CARD_EDIT_CHANGE:
      return {
        ...state,
        thisCard: {
          ...state.thisCard,
          [action.payload.prop]: action.payload.value
        }
      };

    case SORT_CARDS:
      return {
        ...state,
        itemList: state.itemList.slice().sort((a, b) => compareString(a.name, b.name)),
        cardsDirty: true
      };

    case DELETE_SELECTED_CARDS:
      return {
        ...state,
        itemList: state.itemList.filter(item => {
          return item.selected !== true;
        }),
        detailView: false,
        cardsDirty: true
      };

    case ADD_CARD_TAG:
      // ... add this item to the top of this card's tag list ...
      return { 
        ...state,
        thisCard: { ...state.thisCard, 
          tag: '', 
          tags: [ 
            action.payload.tag,
            ...state.thisCard.tags
          ]
        },
        //cardsDirty: true - don't set this as card is not saved (like adding a field)
      };

    case ADD_CARD:
      // ... add this item to the top of the card list ...
      return { 
        ...state,
        itemList: [{
            key: action.payload.key,
           name: action.payload.name,
           desc: action.payload.desc,
           icon: action.payload.icon,
         rating: action.payload.rating,
       category: action.payload.category,
          image: {},
        barcode: {},
           tags: action.payload.tags,
          notes: [],
       selected: false },
          ...state.itemList
        ],
        cardsDirty: true
      };

    case UPDATE_CARD:
      return {
        ...state,
        itemList: state.itemList.map(card => 
          (card.key === action.payload.key ? 
            { ...card, 
              name: action.payload.name,
              desc: action.payload.desc,
              icon: action.payload.icon,
            rating: action.payload.rating,
          category: action.payload.category,
          selected: action.payload.isSelected } : card)),
        cardsDirty: true 
      };

    case REMOVE_CARD:
      return {
        ...state,
        categories: state.categories.filter(card => {
          return card.key !== action.payload.key;
        }),
        thisCard: {
          key: '',
          tag: '',
          note: '',
          name: '',
          desc: '',
          icon: '',
          rating: 0,
          category: '',
          image: {},
          barcode: {},
          tags: [],
          notes: []
        },
        cardsDirty: true, 
        detailView: false
      };

    case CLEAR_CARD:
      return {
        ...state,
        thisCard: {
          key: '',
          tag: '',
          note: '',
          name: '',
          desc: '',
          icon: '',
          rating: 0,
          category: '',
          image: {},
          barcode: {},
          tags: [],
          notes: []
        },
        detailView: false
      };

    case CURRENT_CARD:
      return {
        ...state,
        cardFound: state.categories.find(card => {
          return card.key === action.payload.key;
        }),
        thisCard: {
          key: this.cardFound.key,
          //tag: '',
          //note: '',
          name: this.cardFound.name,
          desc: this.cardFound.desc,
          icon: this.cardFound.icon,
          rating: this.cardFound.rating,
          category: this.cardFound.category,
          image: this.cardFound.image,
          barcode: this.cardFound.barcode,
          tags: this.cardFound.tags,
          notes: this.cardFound.notes
        },
        detailView: true
      };

    case LOAD_CARDS_SUCCESS:
      // ... restore the user's card list ...
      return { 
        ...state,
        itemList: action.payload.itemList
      };

    case SAVE_CARDS_SUCCESS:
      return {
        ...state,
        cardsDirty: false,   // ... list has been saved ...
        thisCard: {       // ... clear the current record ...
          key: '',
          tag: '',
          note: '',
          name: '',
          desc: '',
          icon: '',
          rating: 0,
          category: '',
          image: {},
          barcode: {},
          tags: [],
          notes: []
        }
      };

/*
    case 'INITIAL_FETCH':
      return {
        ...state,
        categories: action.payload
      };
*/

    default: return state;
  
  }
};

export default CardReducer;
