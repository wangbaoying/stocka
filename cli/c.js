/**
 * 使用 brain.js 做神经网络分析。
 */

var _ = require('lodash');
var brain = require('brain.js');

var example1 = function(){
  var net = new brain.NeuralNetwork();
  net.train([{input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},
             {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},
             {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]);

  var output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }

  console.log(output);  
};
example1();


var example2 = function(){

  const a = character(
    '.#####.' +
    '#.....#' +
    '#.....#' +
    '#######' +
    '#.....#' +
    '#.....#' +
    '#.....#'
  );
  const b = character(
    '######.' +
    '#.....#' +
    '#.....#' +
    '######.' +
    '#.....#' +
    '#.....#' +
    '######.'
  );
  const c = character(
    '#######' +
    '#......' +
    '#......' +
    '#......' +
    '#......' +
    '#......' +
    '#######'
  );

  /**
   * Learn the letters A through C.
   */
  const net = new brain.NeuralNetwork();
  net.train([
    { input: a, output: { a: 1 } },
    { input: b, output: { b: 1 } },
    { input: c, output: { c: 1 } }
  ]);

  /**
   * Predict the letter A, even with a pixel off.
   */
  const result = brain.likely(character(
    '.#####.' +
    '#.....#' +
    '#.....#' +
    '###.###' +
    '#.....#' +
    '#.....#' +
    '#.....#'
  ), net);

  const result1 = brain.likely(character(
    '.#####.' +
    '#.....#' +
    '#.....#' +
    '###.###' +
    '#.....#' +
    '#.....#' +
    '#######'
  ), net);

  console.log(result, result1); // 'a'

  /**
   * Turn the # into 1s and . into 0s. for whole string
   * @param string
   * @returns {Array}
   */
  function character(string) {
    return string
      .trim()
      .split('')
      .map(integer);
  }

  /**
   * Return 0 or 1 for '#'
   * @param character
   * @returns {number}
   */
  function integer(character) {
    if ('#' === character) return 1;
    return 0;
  }

};


example2();