"use client"
import dynamic from 'next/dynamic';
import React from 'react';
import './BanerStyle.css';

export default function Baner({ titel, uptitle, suptitle }) {
    return (
        <div>
            <section className="baner p-6 text-center">
                <div className='mt-[7rem]'>
                    <h2 className="text-white text-3xl font-bold">{uptitle} / {titel}{suptitle? " / "+ suptitle : ""}</h2>
                </div>
            </section>
        </div>
    );
}