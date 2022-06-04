"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName(story.url);
  return $(`
      <li id="${story.storyId}">
        <a href="#" id ="favorite" class="story-link ${showFavorite(story, currentUser)}">&#9733</a>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        ${getGarbageCan(currentUser, story)}
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function addNewStory(evt){
  evt.preventDefault();
  
  const title = $("#title").val();
  const author = $("#author").val();
  const url = $("#url").val();

  await storyList.addStory(currentUser, {title, author, url});
  putStoriesOnPage();
  updateUIOnUserLogin();
}

$submitForm.on("submit", addNewStory);

function showFavorite(story, currentUser){
  const userFavs = currentUser.favorites;
  if(userFavs.some(function(fav){
    return fav.storyId === story.storyId;
  })){
    return "fav";
  }
  else{
    return "notFav";
  }
}
$allStoriesList.on("click", "#favorite", function(e){
  const $currStory = $(e.target.closest("li"));
  
  currentUser.changeFavorite($currStory.attr("id"), e.target);
  updateStar(e.target)
})

function updateStar(target){
  target.classList.toggle("fav");
  target.classList.toggle("notFav");
}

function getGarbageCan(currentUser, story){
  const userStories = currentUser.ownStories;
  if(userStories.some(function(stry){
    return stry.storyId === story.storyId;
  })){
    return "<img class='story-delete' src='https://www.pngfind.com/pngs/m/315-3150102_thin-recycle-bin-delete-garbage-full-svg-png.png'>";
  }
  else{
    return "";
  }
}

$allStoriesList.on("click", ".story-delete", function(e){
  const $currStory = $(e.target.closest("li"));

  storyList.deleteStory($currStory.attr("id"));
  $currStory.remove();
})


