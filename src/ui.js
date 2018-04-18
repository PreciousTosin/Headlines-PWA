import posts from './postView/postPage';

export default function appendPostBody(element) {
  element.empty();
  element.append(posts());
}
