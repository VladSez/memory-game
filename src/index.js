import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";

import "./styles.css";
import { initialData } from "./data";
import { shuffle } from "./utils";

const container = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  },
  rest: { scale: 1 },
  pressed: { scale: 0.95 }
};

const variants = {
  visible: { scale: 0 },
  hidden: { scale: 0.5 }
};

function App() {
  const [data, setData] = useState(shuffle(initialData));
  const [firstSelection, setCurrent] = useState(null);
  const [next, setNext] = useState(null);
  const [isReady, setReady] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = false;
    if (!isMounted) {
      setTimeout(() => {
        setData(prevState => {
          return prevState.map(el => {
            return { ...el, isHidden: !el.isHidden };
          });
        });
        setReady(true);
      }, 3000);
    }
    return () => (isMounted = true);
  }, []);

  const changeData = id => {
    const selectedItem = data.find(el => el.id === id);
    const noneIsSelected = !firstSelection;
    const oneIsSelected = firstSelection;
    const oneAndTwoAreNotEqual = checkCardEquality(
      firstSelection,
      selectedItem
    );
    if (noneIsSelected) {
      setCurrent(selectedItem);
    }
    if (oneIsSelected) {
      setNext(selectedItem);
      if (oneAndTwoAreNotEqual) {
        undoSelection(firstSelection, selectedItem);
      } else {
        successSelection(firstSelection, selectedItem);
      }
    }
    rollTheCard(id);
  };

  const rollTheCard = id => {
    setData(prevState => {
      return prevState.map(el =>
        el.id === id ? { ...el, isHidden: !el.isHidden } : el
      );
    });
  };

  const checkCardEquality = (firstSelection, selectedItem) => {
    if (!firstSelection) {
      return true;
    }
    if (firstSelection.id === selectedItem.id) {
      return true;
    }
    if (firstSelection.src !== selectedItem.src) {
      return true;
    }
    return false;
  };

  const undoSelection = (current, next) => {
    if (current.id === next.id) {
      setTimeout(() => {
        setData(prevState => {
          return prevState.map(el =>
            el.id === current.id ? { ...el, isHidden: !el.isHidden } : el
          );
        });
      }, 1000);
    }
    setTimeout(() => {
      setData(prevState => {
        return prevState.map(el =>
          el.id === current.id || el.id === next.id
            ? { ...el, isHidden: !el.isHidden }
            : el
        );
      });
    }, 1000);
    setCurrent(null);
    setNext(null);
  };

  const successSelection = (current, next) => {
    setSuccess(true);
    setTimeout(() => {
      setData(prevState => {
        const check = el => el.id !== current.id && el.id !== next.id;
        return prevState.filter(check);
      });
      setSuccess(false);
      setCurrent(null);
      setNext(null);
    }, 1500);
  };

  const getStyle = id => {
    if (
      (isSuccess && firstSelection && firstSelection.id === id) ||
      (next && next.id === id)
    ) {
      return "img success";
    } else {
      return "img";
    }
  };

  return (
    <div className="App">
      <div className="container">
        <motion.div
          className="img-container"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <div className="example-container">
            <button onClick={() => setIsOpen(!isOpen)}>click</button>
            <motion.div
              animate={isOpen ? "visible" : "hidden"}
              variants={variants}
              classname="test"
            />
          </div>
          {data.length === 0 && <Win />}
          {/* {data.map(props => {
            let go =
              (isSuccess && firstSelection && firstSelection.id === props.id) ||
              (next && next.id === props.id);
            return (
              <Item
                key={props.id}
                {...props}
                isReady={isReady}
                getStyle={getStyle}
                changeData={changeData}
                go={go}
              />
            );
          })} */}
        </motion.div>
      </div>
    </div>
  );
}

function Item({ id, isHidden, src, isReady, getStyle, changeData }) {
  return (
    <motion.div
      key={id}
      variants={item}
      initial="rest"
      whileTap="pressed"
      style={
        isHidden ? { background: "white" } : { backgroundImage: `url(${src})` }
      }
      className={getStyle(id)}
      onClick={isReady ? () => changeData(id) : null}
    />
  );
}

function Win() {
  return (
    <div className="example-container">
      <motion.div
        animate={{
          scale: [1, 2, 2, 1, 1],
          rotate: [0, 0, 270, 270, 0],
          borderRadius: ["20%", "20%", "50%", "50%", "20%"]
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1]
        }}
      >
        You won
      </motion.div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
