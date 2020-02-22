import React from 'react';

import { Layout } from '../components/layout';
import SEO from '../components/seo';

const NotFoundPage = () => (
  <Layout siteMetadata={{ title: '404 Not Found' }}>
    <SEO title="404: Not found" />
    <h1>NOT FOUND</h1>
  </Layout>
);

export default NotFoundPage;
