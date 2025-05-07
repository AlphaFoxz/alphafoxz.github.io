import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'AlphaFoxz',
  description: 'A VitePress Site',
  head: [['link', { rel: 'icon', href: '/avatar.png' }]],
  base: '/',
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh',
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: '主页', link: '/zh/' },
          { text: '项目经历', link: '/zh/experience/1-government' },
          { text: '个人作品', link: '/zh/open-source/1-monaco-tree-editor' },
          { text: '领域驱动设计', link: '/zh/ddd/1-core-methodology' },
        ],
        sidebar: {
          '/zh/experience/': [
            {
              text: '项目经历',
              items: [
                { text: '政府项目', link: '/zh/experience/1-government' },
                { text: '企业项目', link: '/zh/experience/2-enterprise' },
              ],
            },
          ],
          '/zh/ddd/': [
            {
              text: '领域驱动设计',
              items: [
                { text: 'DDD 核心方法论', link: '/zh/ddd/1-core-methodology' },
                { text: 'DDD 重构老项目', link: '/zh/ddd/2-refactoring' },
                { text: 'DDD 的学习方法和路径', link: '/zh/ddd/3-study-way' },
                { text: '六边形架构', link: '/zh/ddd/4-hexagonal-architecture' },
                { text: 'DDD 与 CQRS', link: '/zh/ddd/5-cqrs' },
                { text: '聚合的上下限', link: '/zh/ddd/6-aggregate-boundaries' },
                { text: '事件风暴', link: '/zh/ddd/7-event-storming' },
                { text: '限界上下文', link: '/zh/ddd/8-bounded-context' },
                { text: '事件溯源', link: '/zh/ddd/9-event-sourcing' },
                { text: 'LMAX 架构', link: '/zh/ddd/10-lmax' },
                { text: '子领域', link: '/zh/ddd/11-subdomain' },
                { text: 'DDD 与 MVC', link: '/zh/ddd/12-mvc' },
                { text: 'DDD 与微服务', link: '/zh/ddd/13-microservices' },
                { text: 'DDD 与敏捷开发', link: '/zh/ddd/14-agile-development' },
              ],
            },
          ],
          '/zh/open-source/': [
            {
              text: '个人作品',
              items: [
                { text: 'monaco-tree-editor', link: '/zh/open-source/1-monaco-tree-editor' },
                { text: 'oneboot', link: '/zh/open-source/2-oneboot' },
                { text: 'restful-dsl-java', link: '/zh/open-source/3-restful-dsl-java' },
              ],
            },
          ],
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/AlphaFoxz' },
          { icon: 'qq', link: 'tencent://message/?uin=841958335&Site=&Menu=yes' },
        ],
      },
    },
  },
})
