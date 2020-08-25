// eslint-disable-next-line
import React, { useState, useEffect, useRef } from 'react'
import s from './s.module.scss'
import { Icon, Slider, Label } from 'office-ui-fabric-react'
import * as monaco from 'monaco-editor'
import { useObservable } from 'rxjs-hooks'
import { map, switchMap, merge, debounceTime } from 'rxjs/operators'
import { Screen$, key$ } from '@/subscribe'
import { editer$ } from '../subj'
import { editer_setting$ } from '@/subject'
import { zen$, etbottom$, ettop$, etnext$, etprev$ } from './subj'
import { shallowCopy } from '@/rx/shallow-copy'
import { check_words$ } from './util'
import CtrlBar from './ctrl-bar'
import { search_text$ } from '@/subject/search'
import { default_editer_option } from '@/plugin/monaco-editer/option'
import { monaco_option_use$ } from '@/subject/monaco'
import { node_use$ } from '@/source/node'
import { get_cur_book_src } from '@/source/book'
import HeadStack from './head-stack'
import { node_text_saver$, node_text_from_fs$ } from '@/source/node/txt'

interface p {
    w: number
    h: number
}

export default function Workspace(p: p) {
    const be_zen = useObservable(() => zen$)
    const zencls = be_zen ? s.zenmodel : s.commonmodel
    return (
        <div
            className={s.Workspace}
            style={{
                width: p.w + 'px',
                height: p.h + 'px',
            }}
        >
            <HeadStack />
            <div className={zencls}>
                <CtrlBar />
                <Write />
            </div>
        </div>
    )
}

/** 编辑区 */
function Write() {
    const ref = useRef<null | HTMLDivElement>(null)

    // 提供给边框用
    const [w, set_w] = useState(0)
    const [h, set_h] = useState(0)
    const ESet = useObservable(() => editer_setting$.pipe(shallowCopy()))
    const transform = ESet?.editer.editer_transform

    useEffect(() => {
        const dom = ref.current
        if (!dom) {
            return
        }
        const options = default_editer_option()
        const editer = monaco.editor.create(dom, options)
        editer$.next(editer)

        editer.onKeyUp(() => {
            const t = editer.getValue()
            const node = node_use$.value
            const book_src = get_cur_book_src()
            if (node) {
                check_words$.next(editer) // 检查敏感词
                if (book_src) {
                    // 存储保存需要的资料
                    node_text_saver$.next({
                        book_src: book_src,
                        node_id: node.id,
                        text: t,
                        node_name: node.name,
                    })
                }
            } else {
                // alert('当前没有选中节, 无法保存编辑内容')
                editer.setValue('当前没有选中节, 无法保存编辑内容')
            }
        })
        // 切换节时
        const ob_change_node = node_use$.subscribe(() => {
            editer.revealLine(0) // 滚动到第一行
        })
        // 自动大小
        const ob = editer_setting$
            .pipe(merge(Screen$.pipe(debounceTime(500))), merge(zen$.pipe(debounceTime(500))))
            .subscribe(() => {
                const layout = editer_setting$.value.editer.editer_layout
                const o = {
                    width: ((dom.clientWidth * layout.width) / 100) | 0,
                    height: ((dom.clientHeight * layout.height) / 100) | 0,
                }
                set_w(o.width)
                set_h(o.height)
                editer.layout(o)
            })
        // 观察应用配置
        const ob_app = editer_setting$.subscribe((t) => {
            monaco.editor.setTheme(t.common.theme)
        })
        /** monaco配置
         * 因为链了编辑器设置, 所以加个抖动
         */
        const ob_opt = monaco_option_use$.pipe(debounceTime(100)).subscribe((opt) => {
            editer.updateOptions(opt)
            editer.render()
        })
        // 文本, 加一个延迟是为了缩放后, 切到别的页面切回来不闪一下
        const ob_t = node_text_from_fs$.pipe(debounceTime(50)).subscribe((t) => {
            editer.setValue(t)
            check_words$.next(editer)
        })
        // 编辑器向下滚动
        const ob_scroll_bottom = etbottom$.subscribe(() => {
            const t = editer.getScrollTop()
            const ly = editer.getLayoutInfo().height
            editer.setScrollTop(t + ly - 20)
        })
        // 编辑器向上滚动
        const ob_scroll_top = ettop$.subscribe(() => {
            const t = editer.getScrollTop()
            const ly = editer.getLayoutInfo().height
            editer.setScrollTop(t - ly + 20)
        })
        return () => {
            // 自动保存
            editer.dispose()
            ob_t.unsubscribe()
            ob.unsubscribe()
            ob_app.unsubscribe()
            ob_change_node.unsubscribe()
            ob_scroll_bottom.unsubscribe()
            ob_scroll_top.unsubscribe()
            ob_opt.unsubscribe()
        }
    }, [])
    useEffect(() => {
        // 快捷键, 滚动
        const ob_key = key$.subscribe((k) => {
            if (!(k.alt && !k.ctrl && !k.shift)) {
                return
            }
            // alt 1
            if (k.code === 49) {
                etbottom$.next()
            }
            if (k.code === 50) {
                etnext$.next()
            }
            if (k.code === 51) {
                etprev$.next()
            }
            // alt 4
            if (k.code === 52) {
                ettop$.next()
            }
        })
        return () => ob_key.unsubscribe()
    }, [])
    return (
        <div
            className={s.Write}
            style={{
                transform: `translate(${transform?.width ?? 0}px, ${transform?.height ?? 0}px)`,
            }}
        >
            <div className={s.editer} ref={ref}></div>
            <div
                className={s.outline}
                style={{
                    width: w + 'px',
                    height: h + 'px',
                }}
            ></div>
            <div
                className={s.readctrl}
                style={{
                    // left: `calc(50% - ${w / 2}px)`,
                    width: w + 'px',
                    transform: `translate(-50%, ${(h / 2) | 0}px)`,
                }}
            >
                <div
                    title="alt/command 3"
                    className={s.onec}
                    onClick={() => {
                        etprev$.next()
                    }}
                >
                    ←
                </div>
                <div
                    title="alt/command 4"
                    className={s.onec}
                    onClick={() => {
                        ettop$.next()
                    }}
                >
                    ↑
                </div>
                <div
                    title="alt/command 1"
                    className={s.onec}
                    onClick={() => {
                        etbottom$.next()
                    }}
                >
                    ↓
                </div>
                <div
                    title="alt/command 2"
                    className={s.onec}
                    onClick={() => {
                        etnext$.next()
                    }}
                >
                    →
                </div>
            </div>
        </div>
    )
}
