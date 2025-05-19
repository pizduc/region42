// components/Footer.tsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white text-center p-4 mt-10">
      <p className="text-sm">
        &copy; 2025 ООО "УК "Регион 42". Все права защищены.
      </p>
      <p className="text-sm">
        ИНН: 4205269779 | КПП: 420501001 | ОГРН: 1134205015130
      </p>
      <p className="text-sm">
        Адрес: 650065, Кемеровская область, г. Кемерово, пр-кт Комсомольский,
        д. 11А, кв. 217
      </p>
      <p className="text-sm">
        Телефон диспетчерской службы:{" "}
        <a href="tel:+73842463333" className="text-blue-400 hover:underline">
          +7 (3842) 46-33-33
        </a>
      </p>
      <p className="text-sm">
        Телефон офиса:{" "}
        <a href="tel:+73842346671" className="text-blue-400 hover:underline">
          +7 (3842) 34-66-71
        </a>
      </p>
      <p className="text-sm">
        E-mail:{" "}
        <a
          href="mailto:kemerovo_gkh@mail.ru"
          className="text-blue-400 hover:underline"
        >
          kemerovo_gkh@mail.ru
        </a>
      </p>
      <p className="text-sm">
        Официальный сайт:{" "}
        <a
          href="http://ук-регион42.рф"
          className="text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          ук-регион42.рф
        </a>
      </p>
      <p className="text-sm">
        Директор: Николаенко Елена Юрьевна
      </p>
    </footer>
  );
};

export default Footer;
