const React = require('react');

module.exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([<script key="prism-js" src="/prism.js" />]);
};
