
import {
  FaBars,
  FaPlus,
  FaRegCommentAlt,
  FaTrash,
  FaUserCircle,
} from "react-icons/fa";
import { useChat } from "../Context/chatContext";
import { checkAuthStatus } from "../helpers/api-communicator";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { chats, currentChatId, createNewChat, switchToChat, deleteChat } =
    useChat();

  const handleNewChat = () => {
    createNewChat();
  };

  const handleChatClick = (chatId: string) => {
    switchToChat(chatId);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      deleteChat(chatId);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }
  };

  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await checkAuthStatus();
        setUser({ name: userData.name, email: userData.email });
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? "w-64" : "w-16"
      }`}
      style={{
        backgroundColor: "var(--bg-header)",
        backdropFilter: "blur(8px)",
        color: "var(--text-primary)",
        borderRight: "1px solid var(--border-muted)",
        zIndex: 10,
      }}
    >
      {/* Menu toggle button */}
      <div className="p-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xl p-2 rounded-full hover:bg-[var(--custom-bg-three)] transition-colors"
          style={{ color: "var(--text-accent)" }}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      </div>

      {/* New Chat button */}
      <div className="p-3">
        {isOpen ? (
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 rounded-md text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: "var(--btn-primary-bg)",
            }}
          >
            <FaPlus /> New Chat
          </button>
        ) : (
          <button
            onClick={handleNewChat}
            className="mx-auto flex items-center justify-center w-10 h-10 rounded-full text-white hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: "var(--btn-primary-bg)",
            }}
            aria-label="New chat"
          >
            <FaPlus />
          </button>
        )}
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto py-2 hide-scrollbar">
        {isOpen ? (
          <div className="px-3">
            <h3
              className="text-xs uppercase font-medium mb-2 px-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Recent Chats
            </h3>
            {chats.length === 0 ? (
              <div
                className="text-sm text-center py-4"
                style={{ color: "var(--text-secondary)" }}
              >
                No chats yet
              </div>
            ) : (
              chats.slice(0, 20).map((chat) => {
                const hasUserMessage = chat.messages.some(
                  (msg) => msg.sender === "user"
                );

                if (!hasUserMessage) {
                  return null; // Don't render this chat if no user message
                }

                return (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer mb-1 hover:bg-[var(--custom-bg-one)] transition-colors ${
                      currentChatId === chat.id
                        ? "bg-[var(--custom-bg-one)]"
                        : ""
                    }`}
                  >
                    <FaRegCommentAlt
                      className="shrink-0 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    />
                    <div className="truncate flex-1 min-w-0">
                      <div className="text-sm truncate" title={chat.title}>
                        {chat.title}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatTimestamp(chat.updatedAt)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                      aria-label="Delete chat"
                    >
                      <FaTrash className="text-xs text-red-500" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-2">
            {/* Chat icons hidden when sidebar is closed */}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-3 mt-auto">
        {isOpen ? (
          <div className="flex items-center gap-3 cursor-pointer">
            <FaUserCircle className="text-3xl text-[var(--text-secondary)]" />
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">
                {user?.name || "Loading..."}
              </span>
              <span className="text-xs text-[var(--text-secondary)] truncate">
                {user?.email || ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <FaUserCircle className="text-2xl text-[var(--text-secondary)]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;