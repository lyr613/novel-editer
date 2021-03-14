import { StyleSheet } from 'aphrodite'
import { StyleTheme } from 'style-/theme'
import { css } from 'aphrodite/no-important'

interface style_vo {
    /** 组件顶层 */
    book_edit: object
}
/** 样式 */
export const style: style_vo = StyleSheet.create<style_vo>({
    book_edit: {
        position: 'relative',
        overflow: 'hidden',
        fontSize: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: StyleTheme.style_vars.themeLight,
    },
})
