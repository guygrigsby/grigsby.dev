import React, { Fragment } from "react"
import { Styled } from "theme-ui"

/**
 * Change the content to add your own bio
 */

export default () => (
  <Fragment>
    Hey, I'm <Styled.a href="http://grigsby.dev/">Guy</Styled.a>
    {` `}
    <br />
    I am a software engineer and I love to eat tacos.
  </Fragment>
)
