import Chat from '../farmer/Chat';

export default function ExpertChat() {
  // We can reuse the exact same Chat component since the logic 
  // (fetching conversations, sockets) is based on the authenticated user's ID
  // and the backend handles the role implicitly.
  return <Chat />;
}
