import Chat from "./chat/chat";

export default function Home() {
  return (
    <>
      <main>
        <Chat presence={{ visible: true }} />
      </main>
    </>
  );
}
