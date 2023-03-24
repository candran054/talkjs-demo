import Chat from "./chat/chat";
import OtherUser from "./chat/users/otherUser";

export default function Home() {
  return (
    <>
      <main>
        <Chat presence={{ visible: true }} />
      </main>
    </>
  );
}
