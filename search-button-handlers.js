import { stopSearch, startSearch } from './search-functions.js';

let showingSearchForm = true;
$('#result-list').hide();

const handleStartSearch = () => {
  const search = getSearchObjectFromForm();
  console.log(search);
  startSearch(search);
  console.log('Starting Search');
  document.getElementById('startSearchButton').innerHTML =
    'Let the search be over';
  toggleSearchForm();
};

const handleStopSearch = () => {
  stopSearch();
  console.log('Ending Search');
  document.getElementById('startSearchButton').innerHTML =
    'Let the search begin';
  toggleSearchForm();
};

const getSearchObjectFromForm = () => {
  let topics = [];
  let distance = $('#distanceInput').val();
  let description = $('#descriptionInput').val();

  if ($('#techCheckbox').prop('checked')) {
    topics.push('TECH');
  }
  if ($('#mtgCheckbox').prop('checked')) {
    topics.push('MTG');
  }
  if ($('#nerdCheckbox').prop('checked')) {
    topics.push('NERD');
  }

  return {
    topics,
    distance,
    description,
  };
};

const toggleSearchForm = () => {
  if (showingSearchForm) {
    $('#search-form').hide();
    $('#result-list').show();
  } else {
    $('#search-form').show();
    $('#result-list').hide();
  }
  showingSearchForm = !showingSearchForm;
};

export { handleStartSearch, handleStopSearch };
