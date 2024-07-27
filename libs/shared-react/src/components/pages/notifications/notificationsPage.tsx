import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const NotificationsPage = () => {
  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();

  const navigate = useNavigate();

  useEffect(() => {
    const encodedData = query.get("data");
    const data = encodedData && decodeURIComponent(encodedData);
    const chat = (data && JSON.parse(data))?.conversationId;
    chat && navigate("/chats?chatId=" + chat);
  }, [query]);

  return <></>;
};
