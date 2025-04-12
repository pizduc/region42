const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white text-center p-4 mt-10">
        <p className="text-sm">&copy; 2025 ООО "УК "Регион 42". Все права защищены.</p>
        <p className="text-sm">ИНН: 4205269779 | ОГРН: 1134205015130</p>
        <p className="text-sm">Адрес: 650065, Кемеровская область, город Кемерово, Комсомольский пр-кт, д.11 к.а, 217  </p>
        <p className="text-sm">
          Связаться с нами:{" "}
          <a href="mailto:info@city-tech.ru" className="text-blue-400 hover:underline">
            sity-park@list.ru
          </a>
        </p>
      </footer>
    );
  };
  
  export default Footer;
  