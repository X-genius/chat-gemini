import { createContext, useState } from 'react';
import run from '../config/gemini';

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState('');
  const [recentPrompt, setRecentPrompt] = useState('');
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState('');

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const onSent = async (prompt) => {
    setResultData('');
    setLoading(true);
    setShowResult(true);

    let response;
    if (prompt !== undefined) {
      setPrevPrompts((prev) => [...prev, prompt]);
      setRecentPrompt(prompt);
      response = await run(prompt);
    } else {
      setPrevPrompts((prev) => [...prev, input]);
      setRecentPrompt(input);
      response = await run(input);
    }

    let splitDoubleStar = response.split('**');
    let getOrganizeResp = '';
    for (let i = 0; i < splitDoubleStar.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        getOrganizeResp += splitDoubleStar[i];
      } else {
        getOrganizeResp += '<b>' + splitDoubleStar[i] + '</b>';
      }
    }
    let splitSingleStarInResp = getOrganizeResp.split('*').join('</br>');

    let actualResponse = splitSingleStarInResp.split(' ');
    for (let i = 0; i < actualResponse.length; i++) {
      const nextWord = actualResponse[i];
      delayPara(i, nextWord + ' ');
    }

    setResultData(splitSingleStarInResp);
    setLoading(false);
    setInput('');
  };

  const contextValue = {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    prevPrompts,
    setPrevPrompts,
    onSent,
    showResult,
    loading,
    resultData,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
