import React, { useEffect, useState, useRef } from "react";
import Talk from "talkjs";

export default function OtherUser() {
  const [talkLoaded, markTalkLoaded] = useState(false);
  const chatboxEl = useRef<HTMLDivElement>(null);
  const key = "sk_test_IoznpCr4fyJjaUJ3nuzCy9eZ2opBiamJ";
  const userID = "tnNKfxw3";

  useEffect(() => {
    Talk.ready.then(() => markTalkLoaded(true));
    if (talkLoaded) {
      const otherUser = new Talk.User({
        id: "1",
        name: "John Doe",
        email: "johndoe@example.com",
        photoUrl: "img1",
        welcomeMessage: "Hello, Im John Doe",
        role: "default",
      });

      const currentUser = new Talk.User({
        id: "2",
        name: "Jessica Wales",
        email: "jessicawales@example.com",
        photoUrl: "img2",
        welcomeMessage: "Hi, my name is Jessica Wales",
        role: "default",
      });

      const session = new Talk.Session({
        appId: userID,
        me: currentUser,
      });

      const conversationId = Talk.oneOnOneId(currentUser, otherUser);
      const conversation = session.getOrCreateConversation(conversationId);
      conversation.setParticipant(currentUser);
      conversation.setParticipant(otherUser);

      const chatbox = session.createChatbox();

      chatbox.mount(chatboxEl.current);
      return () => session.destroy();
    }
  }, [talkLoaded]);

  return (
    <div className="flex w-full">
      <div className="w-full h-screen" ref={chatboxEl} />
    </div>
  );
}
