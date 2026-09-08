<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">XML Sitemap Index</xsl:when>
            <xsl:otherwise>XML Sitemap</xsl:otherwise>
          </xsl:choose>
        </title>
        <style>
          body {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            color: #10233f;
            background: #f5f8fc;
          }

          .page {
            max-width: 1100px;
            margin: 0 auto;
            padding: 40px 24px 72px;
          }

          h1 {
            margin: 0 0 20px;
            font-size: 40px;
            line-height: 1.1;
          }

          .intro {
            margin: 0 0 28px;
            padding: 18px 20px;
            border: 1px solid #7bb5e9;
            background: #dff0ff;
            line-height: 1.6;
          }

          .intro p {
            margin: 0;
          }

          .intro p + p {
            margin-top: 10px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
          }

          th,
          td {
            padding: 12px 14px;
            border-bottom: 1px solid #d7e4f3;
            vertical-align: top;
            text-align: left;
            font-size: 15px;
          }

          th {
            font-size: 13px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #35516f;
            background: #eef5fc;
          }

          tr:nth-child(even) td {
            background: #fafcff;
          }

          a {
            color: #0a5ea8;
            text-decoration: none;
            word-break: break-word;
          }

          a:hover {
            text-decoration: underline;
          }

          .summary {
            margin: 18px 0 26px;
            color: #4c6280;
            font-size: 15px;
          }

          .footer {
            margin-top: 30px;
            color: #627991;
            font-size: 14px;
            line-height: 1.5;
          }

          .footer p {
            margin: 0;
          }

          .footer p + p {
            margin-top: 8px;
          }

          @media (max-width: 700px) {
            .page {
              padding: 28px 16px 48px;
            }

            h1 {
              font-size: 30px;
            }

            th,
            td {
              padding: 10px 10px;
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <h1>
            <xsl:choose>
              <xsl:when test="sitemap:sitemapindex">XML Sitemap Index</xsl:when>
              <xsl:otherwise>XML Sitemap</xsl:otherwise>
            </xsl:choose>
          </h1>

          <div class="intro">
            <p>This XML sitemap is used by search engines which follow the XML sitemap standard. Follow the links below to inspect the sitemap contents.</p>
            <p>
              <xsl:choose>
                <xsl:when test="sitemap:sitemapindex">This index groups sitemap files by content type so large travel sections can be crawled and debugged independently.</xsl:when>
                <xsl:otherwise>This sitemap lists the URLs currently published for this content bucket.</xsl:otherwise>
              </xsl:choose>
            </p>
          </div>

          <div class="summary">
            <xsl:choose>
              <xsl:when test="sitemap:sitemapindex">
                <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)" /> sitemap files
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)" /> URLs
              </xsl:otherwise>
            </xsl:choose>
          </div>

          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">
              <table>
                <thead>
                  <tr>
                    <th>URL of sub-sitemap</th>
                    <th>Last modified (GMT)</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <tr>
                      <td>
                        <a href="{sitemap:loc}">
                          <xsl:value-of select="sitemap:loc" />
                        </a>
                      </td>
                      <td>
                        <xsl:value-of select="sitemap:lastmod" />
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <table>
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Last modified (GMT)</th>
                    <th>Change frequency</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td>
                        <a href="{sitemap:loc}">
                          <xsl:value-of select="sitemap:loc" />
                        </a>
                      </td>
                      <td>
                        <xsl:value-of select="sitemap:lastmod" />
                      </td>
                      <td>
                        <xsl:value-of select="sitemap:changefreq" />
                      </td>
                      <td>
                        <xsl:value-of select="sitemap:priority" />
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:otherwise>
          </xsl:choose>

          <div class="footer">
            <p>This stylesheet is for browser readability only. Search engines will consume the raw XML structure.</p>
            <p>Use /sitemap.xml as the single entry point for sitemap submission.</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>