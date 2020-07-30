// eslint-disable-next-line
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import s from './s.module.scss'
import { next_router } from '@/function/router'
import ChapterNode from './chapter-node'
import Outline from './outline'
import Workspace from './workspace'
import Shard from './shard'
import { Screen$ } from '@/subscribe'
import DragLine from '@/component/drag-line'
import { useObservable } from 'rxjs-hooks'
import { shallowCopy } from '@/rx/shallow-copy'
import { find_table_li_auto } from '@/source/table'
import { editer_setting$ } from '@/subject'
import { find_npc_li_auto } from '@/source/npc'
import { find_chapter_li_auto } from '@/source/chapter-node'
import { node_use_buffer$, load_prev_buffer } from '@/source/node'
import { get_cur_book_src } from '@/source/book'
import { filter, take, debounceTime } from 'rxjs/operators'

/** 编辑文本页 */
export default function Edit() {
    const box_ref = useRef<null | HTMLDivElement>(null)
    const [w, set_w] = useState(0)
    const [h, set_h] = useState(0)

    useEffect(() => {
        // 计算各模块的宽高
        const dom = box_ref.current
        if (!dom) {
            return
        }

        const ob = Screen$.pipe().subscribe(() => {
            set_w(dom.clientWidth)
            set_h(dom.clientHeight)
        })
        return () => ob.unsubscribe()
    }, [])

    useEffect(() => {
        const a = setTimeout(() => {
            find_npc_li_auto()
            find_chapter_li_auto()
            find_table_li_auto()
        }, 50)
        return () => {
            clearTimeout(a)
        }
    }, [])
    // 自动加载上次编辑的节列表
    useEffect(() => {
        const ob = node_use_buffer$
            .pipe(
                take(1),
                filter((li) => !li.length),
                debounceTime(100),
            )
            .subscribe(() => {
                load_prev_buffer()
            })
        return () => ob.unsubscribe()
    }, [])

    if (!get_cur_book_src()) {
        next_router('shelf')
        return null
    }
    return (
        <div className={s.Edit} ref={box_ref}>
            {w ? <Inset w={w} h={h} /> : null}
        </div>
    )
}

interface inset {
    w: number
    h: number
}
function Inset(p: inset) {
    const Eset = useObservable(() => editer_setting$.pipe(shallowCopy()))
    if (!Eset) {
        return null
    }
    const lens = Eset.editer.outline_layout
    // const t = 10

    return (
        <>
            <ChapterNode w={lens.width} h={p.h - lens.height} />
            <Outline w={lens.width} h={lens.height} />
            <Workspace w={p.w - lens.width} h={p.h - 30} />
            <Shard w={p.w - lens.width} h={30} />
            <DragLine
                datum="left"
                on_drag={drag_w}
                min={140}
                max={600}
                style={{
                    left: lens.width + 'px',
                }}
            ></DragLine>
            <DragLine
                datum="bottom"
                on_drag={drag_h}
                min={30}
                max={600}
                style={{
                    width: lens.width + 'px',
                    bottom: lens.height + 'px',
                }}
            ></DragLine>
        </>
    )
}

function drag_w(n: number) {
    const eset = editer_setting$.value
    const wh = eset.editer.outline_layout
    wh.width = n
    editer_setting$.next(eset)
}
function drag_h(n: number) {
    const eset = editer_setting$.value
    const wh = eset.editer.outline_layout
    wh.height = n
    editer_setting$.next(eset)
}
