import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Talk from "talkjs";
import useSWR from "swr";
import firebase from "firebase/app";
import { Button } from "@/components/button";
import { auth, authSecondary } from "@/utility/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { GoogleAuthProvider, signInWithRedirect, getAuth } from "firebase/auth";

interface CustomChatbox extends Talk.Chatbox {
  currentUser: Talk.User;
}

interface PresenceProps {
  visible?: boolean;
}

interface Session {
  destroy(): void;
  unreads: any;
}

export default function TalkJs() {
  const chatboxEl = useRef<HTMLDivElement>(null);
  const userID = "tnNKfxw3";
  const conversationID = "a37529a4c152362d7972";
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isCompleteOrder, setIsCompleteOrder] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [unreadCoversations, setUnreadConversations] = useState(0);
  const [user] = useAuthState(auth);
  // const [currentUserPresence] = useState(
  //   presence && presence.visible ? "online" : "offline"
  // );

  const [session, setSession] = useState<Session | null>(null);
  const [chatbox, setChatbox] = useState<Talk.Chatbox | null>(null);
  const [countdown, setCountdown] = useState(0);

  const messagePayload = [
    {
      text: "this transaction is on hold because buyer raised dispute",
      type: "SystemMessage",
      // idempotencyKey: "1",
    },
  ];

  const fetcher = (url: string, payload: any) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    }).then((res) => res.json());
  };

  const { data, error } = useSWR(
    isOnHold
      ? `https://api.talkjs.com/v1/${userID}/conversations/${conversationID}/messages`
      : null,
    (url: string, payload: any) => fetcher(url, messagePayload)
  );

  const handleOrderOnHold = () => {
    setIsOnHold(true);
  };

  useEffect(() => {
    if (data) {
      console.log(data);
    }
    if (error) {
      console.log(error);
    }
  }, [data, error]);

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };
  const signOut = () => {
    auth.signOut();
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = new Talk.User({
      id: auth.currentUser!.uid ?? "",
      name: auth.currentUser!.displayName! ?? "",
      email: auth.currentUser!.email! ?? "",
      photoUrl: auth.currentUser!.photoURL! ?? "",
      role: "default",
    });

    const otherUser = new Talk.User({
      id: auth.currentUser!.uid ?? "",
      name: auth.currentUser!.displayName! ?? "",
      email: auth.currentUser!.email! ?? "",
      photoUrl: auth.currentUser!.email! ?? "",
      role: "otherUser",
    });

    const session = new Talk.Session({
      appId: userID,
      me: currentUser,
    });

    const conversationId = Talk.oneOnOneId(currentUser, otherUser);
    const conversation = session.getOrCreateConversation(conversationId);
    conversation.setParticipant(currentUser);
    conversation.setParticipant(otherUser);

    const chatbox = session.createChatbox({
      showChatHeader: false,
      messageField: {
        visible: !isCompleteOrder,
      },
      presence: {
        visible: true,
      },
    }) as CustomChatbox;
    chatbox.select(conversation);

    chatbox.mount(chatboxEl.current);

    setName(currentUser.name);
    setPhotoUrl(currentUser.photoUrl || "");

    setSession(session);
    setChatbox(chatbox);
  }, [isCompleteOrder, user]);

  const handleOrderComplete = async () => {
    setIsCompleteOrder(true);
    if (chatbox && session) {
      setCountdown(5);
    }
  };

  useEffect(() => {
    let intervalID: any;

    if (countdown && countdown > 0) {
      intervalID = setInterval(() => {
        setCountdown((prevCountdown) =>
          prevCountdown ? prevCountdown - 1 : 0
        );
      }, 1000);
    } else {
      if (session) {
        session?.destroy();
      }
    }

    return () => {
      clearInterval(intervalID);
    };
  }, [countdown]);
  console.log("session changed ", session);

  useEffect(() => {
    const updateUnreadCoversatios = (conversations: any) => {
      const amountOfUnreads = conversations.length;
      setUnreadConversations(amountOfUnreads);

      if (amountOfUnreads > 0) {
        document.title = `(${amountOfUnreads}) MySite`;
      } else {
        document.title = "MySite";
      }

      const badge = document.getElementById("notifier-badge");
      if (badge) {
        badge.textContent = amountOfUnreads;
        badge.style.display = amountOfUnreads > 0 ? "block" : "none";
      }
    };

    session?.unreads.onChange(updateUnreadCoversatios);
  }, []);

  if (!user) {
    return (
      <div>
        <p className="cursor-pointer" onClick={googleSignIn}>
          Sign In
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex  w-full h-screen justify-center ${
        isCompleteOrder ? "pb-8" : "pb-0"
      }`}
    >
      {user ? (
        <div className="flex flex-col w-[420px] max-w-full">
          <div className="bg-[#F6F8FA] flex items-center px-5 py-5">
            <div className="flex items-end justify-end">
              <Image
                src={photoUrl}
                width={40}
                height={40}
                alt={`${name} Avatar`}
                className="rounded-3xl"
              />
              {/* <div
                className={`w-3 h-3 rounded-full absolute ${
                  currentUserPresence === "online"
                    ? "bg-[#00D816]"
                    : "bg-red-600"
                }`}
              /> */}
            </div>
            <div className="flex w-full justify-between">
              <div className="flex flex-col mx-3">
                <p className="text-blackmain font-semibold text-xs">{name}</p>
                {/* <p
                  className={`font-semibold text-xs ${
                    currentUserPresence === "online"
                      ? "text-[#00D816]"
                      : "text-red-600"
                  }`}
                >
                  {currentUserPresence}
                </p> */}
              </div>
              <Button
                className="absolute ml-96"
                variant="primary"
                onClick={handleOrderComplete}
              >
                Transaction complete
              </Button>
              <Button
                className="absolute ml-96 mt-20"
                variant="primary"
                onClick={handleOrderOnHold}
              >
                Transaction on hold
              </Button>
              <Button className="absolute ml-96 mt-40" onClick={signOut}>
                Sign Out
              </Button>
              {/* <div
                id="notifier-badge"
                className="absolute ml-96 mt-40 px-8 py-4 rounded-3xl bg-[#F89602]"
              >
                <p className="font-bold text-xs text-white">Notification</p>
                <p>{unreadCoversations}</p>
              </div> */}
              <div>{countdown}</div>
              <div className="flex flex-col">
                <p className="text-blackmain text-xs">order no</p>
                <p className="text-blackmain text-xs">#41231221</p>
              </div>
            </div>
            <div />
          </div>
          <div className="w-full h-full" ref={chatboxEl} />
        </div>
      ) : (
        <p onClick={googleSignIn}>Sign In</p>
      )}
      {isCompleteOrder && (
        <div className="w-full items-center py-5 absolute bg-secondary bottom-0">
          <p className="text-center text-xs text-darkgrey">
            Order has completed, you can’t chat anymore
          </p>
        </div>
      )}
    </div>
  );
}
