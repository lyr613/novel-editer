// eslint-disable-next-line
import React, { useState, useEffect } from 'react'
import s from './s.module.scss'
import { PrimaryButton, Dropdown, Slider as SliderSlider, TextField } from 'office-ui-fabric-react'
import { next_router } from '@/function/router'
import { npc_focu$, chapter_list$, node_focu$, node_focu_buffer$, of_npc } from '@/source'
import { useObservable } from 'rxjs-hooks'
import { filter$ } from '../subj'
import ThemeButton from '@/component/theme-button'
import { shallowCopy } from '@/rx/shallow-copy'
import { npc_frequency_find$ } from './subj'

/**
 * 控制栏
 */
export default function Bar() {
    return (
        <div className={s.Bar}>
            <TimeLine />
            <Action />
        </div>
    )
}

/** 顶部时间轴 */
function TimeLine() {
    const fres = useObservable(() => npc_frequency_find$, [])
    const npcf = useObservable(() => npc_focu$)
    const infor = fres.filter((v) => v.id === npcf?.id)[0]

    return (
        <div className={s.TimeLine} title="单击角色, 重要度高于100的将展示出现频率">
            <div className={s.line}>
                {infor &&
                    infor.appear_infors.map((appear) => (
                        <div
                            key={appear.percentage}
                            className={s.hline}
                            onClick={() => {
                                const cps = chapter_list$.value
                                for (const cp of cps) {
                                    for (const node of cp.children) {
                                        // 如果查到章节, 跳到编辑页
                                        if (node.id === appear.node_id) {
                                            node_focu$.next(node)
                                            const new_buffer = [...node_focu_buffer$.value]
                                            if (!new_buffer.find((v) => v.id === appear.node_id)) {
                                                new_buffer.push(node)
                                            }
                                            node_focu_buffer$.next(new_buffer)
                                            next_router('edit')
                                            break
                                        }
                                    }
                                }
                            }}
                            style={{
                                left: appear.percentage + '%',
                            }}
                        ></div>
                    ))}
            </div>
        </div>
    )
}

function Action() {
    const fil = useObservable(() => filter$.pipe(shallowCopy()))
    if (!fil) {
        return null
    }
    return (
        <div className={s.Action}>
            <ThemeButton
                onClick={() => {
                    npc_focu$.next(of_npc())
                    next_router('npc', 'edit')
                }}
            >
                新角色
            </ThemeButton>
            <TextField
                placeholder="搜索"
                value={fil.name}
                onChange={(_, str) => {
                    fil.name = str || ''
                    filter$.next(fil)
                }}
                onFocus={() => {
                    fil.name = ''
                    filter$.next(fil)
                }}
            ></TextField>
        </div>
    )
}
