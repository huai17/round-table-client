import { useEffect, useCallback } from "react";

import {
  join,
  leave,
  reserve,
  changeSource,
  generateSeats,
  kickout,
  connectPeer,
  disposePeer,
} from "./webRtcPeers";

import { setEventListener } from "./eventHandlers";

export const useRoundTable = ({
  onKnightJoined,
  onKnightLeft,
  onMeetingStarted,
  onMeetingStopped,
  onSourceChanged,
  onSeatsUpdated,
  onError,
}) => {
  useEffect(() => {
    if (onKnightJoined) setEventListener("onKnightJoined", onKnightJoined);
  }, [onKnightJoined]);

  useEffect(() => {
    if (onKnightLeft) setEventListener("onKnightLeft", onKnightLeft);
  }, [onKnightLeft]);

  useEffect(() => {
    if (onMeetingStarted)
      setEventListener("onMeetingStarted", onMeetingStarted);
  }, [onMeetingStarted]);

  useEffect(() => {
    if (onMeetingStopped)
      setEventListener("onMeetingStopped", onMeetingStopped);
  }, [onMeetingStopped]);

  useEffect(() => {
    if (onSourceChanged) setEventListener("onSourceChanged", onSourceChanged);
  }, [onSourceChanged]);

  useEffect(() => {
    if (onSeatsUpdated) setEventListener("onSeatsUpdated", onSeatsUpdated);
  }, [onSeatsUpdated]);

  useEffect(() => {
    if (onError) setEventListener("onError", onError);
  }, [onError]);

  return {
    join,
    leave,
    reserve,
    changeSource,
    generateSeats,
    kickout,
  };
};

export const useKnight = ({ source }) => {
  const _connectPeer = useCallback(
    (videoRef) => {
      connectPeer({ source, videoRef });
    },
    [source]
  );

  const _disposePeer = useCallback(() => {
    disposePeer({ source });
  }, [source]);

  return {
    connectPeer: _connectPeer,
    disposePeer: _disposePeer,
  };
};
