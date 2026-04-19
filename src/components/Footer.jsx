import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 py-12 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ШИНЭЧЛЭЛ: md:grid-cols-4 байсныг md:grid-cols-3 болголоо. 
            Ингэснээр 3 хэсэг дэлгэцэнд яг тэнцүү хуваагдаж харагдана. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Logo & About */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <span className="material-symbols-outlined text-3xl">
                music_note
              </span>
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                OPENDEAL
              </h2>
            </div>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Монголын хөгжмийн зэмсгийн худалдааны нэгдсэн веб хуудас. Хөгжмөө
              зар, шинийг ав.
            </p>
          </div>

          {/* 2. Links */}
          <div>
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
              Холбоос
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Бидний тухай
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Үйлчилгээний нөхцөл
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Нууцлалын бодлого
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Тусламж
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Contact */}
          <div>
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
              Бидэнтэй холбогдох
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">mail</span>
                info@opendeal.mn
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">call</span>
                +976 9911-XXXX
              </li>
            </ul>
            <div className="mt-4 flex gap-4">
              <a
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined">public</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
          © {new Date().getFullYear()} OPENDEAL. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
