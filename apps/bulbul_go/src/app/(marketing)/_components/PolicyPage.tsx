import { FileText } from 'lucide-react'

function OperatorDetails() {
    const email = 'bakasovariet00@gmail.com'
    return (
        <div className="bg-gray-50 p-4 rounded-xl space-y-1">
            <p>
                <strong>ИП:</strong> Бакасов Ариет Бактыбекович
            </p>
            <p>
                <strong>ИНН:</strong> 22602200001087
            </p>
            <p>
                <strong>Email:</strong>{' '}
                <a
                    href={`mailto:${email}`}
                    className="text-blue-600 hover:underline"
                >
                    {email}
                </a>
            </p>
        </div>
    )
}

function PrivacyContent() {
    return (
        <div className="space-y-8">
            <div className="pb-6 border-b border-gray-100">
                <p className="text-lg font-semibold text-gray-800">BulBul Go</p>
                <p className="text-sm text-gray-400">
                    Дата последнего обновления: 09 января 2026 года
                </p>
            </div>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    1. Введение
                </h2>
                <p>
                    Добро пожаловать в BulBul Go! Мы ценим ваше доверие и
                    серьезно относимся к защите вашей конфиденциальности.
                    Настоящая Политика конфиденциальности описывает, какую
                    информацию мы собираем, как мы ее используем, храним и
                    защищаем при использовании вами нашего сервиса по организации
                    совместных поездок.
                </p>
                <p className="mt-2 text-sm italic border-l-4 border-blue-500 pl-4 py-1 bg-blue-50">
                    Используя BulBul Go, вы соглашаетесь со сбором и
                    использованием информации в соответствии с настоящей
                    Политикой.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    2. Информация, которую мы собираем
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
                    2.1. Информация при регистрации
                </h3>
                <p className="mb-3">
                    При регистрации через Google или iCloud мы получаем:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Имя и фамилию</li>
                    <li>Адрес электронной почты</li>
                    <li>Фотографию профиля (если доступна)</li>
                    <li>Уникальный идентификатор учетной записи</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                    2.2. Информация о поездках
                </h3>
                <p className="mb-3">
                    При создании объявления о поездке мы собираем:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Пункт отправления и назначения</li>
                    <li>Дату и время поездки</li>
                    <li>Стоимость поездки</li>
                    <li>
                        Количество мест (для водителей) или пассажиров (для
                        пассажиров)
                    </li>
                    <li>Номер телефона для связи</li>
                    <li>
                        Информацию об автомобиле (марка, модель, номер, цвет) —
                        для водителей
                    </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                    2.3. Техническая информация
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>IP-адрес</li>
                    <li>Тип устройства и операционная система</li>
                    <li>Браузер и его версия</li>
                    <li>Данные об использовании приложения</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    3. Как мы используем вашу информацию
                </h2>
                <p className="mb-3">
                    Мы используем собранную информацию для:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Предоставления и улучшения наших услуг</li>
                    <li>Организации связи между водителями и пассажирами</li>
                    <li>
                        Отправки уведомлений о поездках и обновлениях сервиса
                    </li>
                    <li>
                        Обеспечения безопасности и предотвращения мошенничества
                    </li>
                    <li>
                        Анализа использования сервиса и улучшения
                        пользовательского опыта
                    </li>
                    <li>Соблюдения законодательных требований</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    4. Раскрытие информации третьим лицам
                </h2>
                <p className="mb-3">Мы можем передавать вашу информацию:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                        <strong>Другим пользователям:</strong> Информация о
                        поездке (включая номер телефона) становится видна другим
                        пользователям для организации совместной поездки
                    </li>
                    <li>
                        <strong>Сервисным провайдерам:</strong> Компаниям,
                        которые помогают нам в предоставлении услуг (хостинг,
                        аналитика, платежи)
                    </li>
                    <li>
                        <strong>По требованию закона:</strong> Государственным
                        органам при наличии соответствующих законных оснований
                    </li>
                    <li>
                        <strong>При продаже бизнеса:</strong> В случае слияния,
                        продажи или реорганизации компании
                    </li>
                </ul>
                <p className="mt-3 text-sm italic border-l-4 border-amber-500 pl-4 py-1 bg-amber-50">
                    Мы никогда не продаем вашу личную информацию третьим лицам в
                    рекламных целях.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    5. Хранение и защита данных
                </h2>
                <p className="mb-3">
                    Мы принимаем разумные меры для защиты вашей информации:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Использование шифрования при передаче данных (SSL/TLS)</li>
                    <li>
                        Ограничение доступа к персональным данным только
                        уполномоченным сотрудникам
                    </li>
                    <li>Регулярное обновление систем безопасности</li>
                    <li>Хранение данных на защищенных серверах</li>
                </ul>
                <p className="mt-3">
                    Мы храним вашу информацию до тех пор, пока это необходимо для
                    предоставления услуг или в соответствии с законодательством.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    6. Ваши права
                </h2>
                <p className="mb-3">Вы имеете право:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                        <strong>Доступ:</strong> Запросить копию своих
                        персональных данных
                    </li>
                    <li>
                        <strong>Исправление:</strong> Обновить или исправить
                        неточную информацию
                    </li>
                    <li>
                        <strong>Удаление:</strong> Запросить удаление своих данных
                    </li>
                </ul>
                <p className="mt-3">
                    Для реализации своих прав свяжитесь с нами по адресу:{' '}
                    <a
                        href="mailto:support@bulbulgo.com"
                        className="text-blue-600 hover:underline"
                    >
                        support@bulbulgo.com
                    </a>
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    7. Файлы cookie и технологии отслеживания
                </h2>
                <p>
                    Мы используем cookie и аналогичные технологии для улучшения
                    работы сервиса, запоминания ваших предпочтений и анализа
                    использования. Вы можете настроить свой браузер для
                    блокировки cookie, но это может ограничить функциональность
                    сервиса.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    8. Дети
                </h2>
                <p>
                    Наш сервис не предназначен для лиц младше 18 лет. Мы
                    сознательно не собираем информацию от детей. Если вы узнали,
                    что ваш ребенок предоставил нам информацию, свяжитесь с нами
                    для ее удаления.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    9. Изменения в Политике конфиденциальности
                </h2>
                <p>
                    Мы можем периодически обновлять настоящую Политику. О
                    существенных изменениях мы уведомим вас по электронной почте
                    или через уведомление в приложении. Рекомендуем регулярно
                    проверять эту страницу.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    10. Контакты и реквизиты
                </h2>
                <OperatorDetails />
            </section>
        </div>
    )
}

function TermsContent() {
    return (
        <div className="space-y-8">
            <div className="pb-6 border-b border-gray-100">
                <p className="text-lg font-semibold text-gray-800">
                    BulBul Go — Условия использования
                </p>
                <p className="text-sm text-gray-400">
                    Дата последнего обновления: 09 января 2026 года
                </p>
            </div>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    1. Общие положения
                </h2>
                <p className="bg-gray-50 p-4 rounded-xl text-gray-700 mb-3">
                    Настоящие Условия использования регулируют использование
                    платформы BulBul Go. Внимательно ознакомьтесь с ними перед
                    использованием сервиса.
                </p>
                <p className="mb-2">
                    <strong>BulBul Go</strong> — это онлайн-платформа, которая
                    соединяет водителей и пассажиров для совместных поездок. Мы
                    предоставляем технологическую платформу, но не являемся
                    транспортной компанией или перевозчиком.
                </p>
                <p className="mt-3 text-sm italic border-l-4 border-blue-500 pl-4 py-1 bg-blue-50">
                    Используя BulBul Go, вы соглашаетесь с настоящими Условиями.
                    Если вы не согласны, пожалуйста, не пользуйтесь сервисом.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    2. Определения
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                        <strong>Платформа</strong> — сервис BulBul Go, включая
                        веб-сайт и мобильные приложения
                    </li>
                    <li>
                        <strong>Пользователь</strong> — любое лицо, использующее
                        Платформу
                    </li>
                    <li>
                        <strong>Водитель</strong> — пользователь, предлагающий
                        поездку на своем автомобиле
                    </li>
                    <li>
                        <strong>Пассажир</strong> — пользователь, ищущий поездку
                    </li>
                    <li>
                        <strong>Поездка</strong> — совместная поездка,
                        организованная через Платформу
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    3. Регистрация и учетная запись
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
                    3.1. Требования к регистрации
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Вы должны быть не моложе 18 лет</li>
                    <li>Регистрация осуществляется через Google или iCloud</li>
                    <li>
                        Вы обязаны предоставлять точную и актуальную информацию
                    </li>
                    <li>
                        Один пользователь может иметь только одну учетную запись
                    </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                    3.2. Безопасность учетной записи
                </h3>
                <p>
                    Вы несете ответственность за сохранность своей учетной записи
                    и за все действия, совершенные под ней. Немедленно сообщите
                    нам о любом несанкционированном использовании.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    4. Правила для водителей
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
                    4.1. Требования
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Наличие действующего водительского удостоверения</li>
                    <li>Автомобиль в исправном техническом состоянии</li>
                    <li>Действующая страховка автомобиля</li>
                    <li>Соблюдение правил дорожного движения</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                    4.2. Обязанности водителя
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                        Предоставлять точную информацию об автомобиле (марка,
                        модель, номер, цвет)
                    </li>
                    <li>Указывать реальный маршрут, время и стоимость поездки</li>
                    <li>Своевременно информировать пассажиров об изменениях</li>
                    <li>Прибыть в указанное место и время</li>
                    <li>Обеспечить безопасность пассажиров во время поездки</li>
                    <li>Вести себя вежливо и уважительно</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                    4.3. Запрещается
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                        Управлять автомобилем в состоянии алкогольного или
                        наркотического опьянения
                    </li>
                    <li>Превышать заявленное количество пассажиров</li>
                    <li>
                        Требовать оплату, превышающую указанную в объявлении
                    </li>
                    <li>
                        Отклоняться от согласованного маршрута без предупреждения
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    5. Правила для пассажиров
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
                    5.1. Обязанности пассажира
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Быть пунктуальным и прибыть в место встречи вовремя</li>
                    <li>Оплатить поездку согласно договоренности</li>
                    <li>Предупредить водителя об отмене поездки заранее</li>
                    <li>
                        Уважительно относиться к водителю и другим пассажирам
                    </li>
                    <li>Не наносить ущерб автомобилю</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                    5.2. Запрещается
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Курить в автомобиле без разрешения водителя</li>
                    <li>
                        Находиться в состоянии алкогольного или наркотического
                        опьянения
                    </li>
                    <li>Перевозить запрещенные или опасные предметы</li>
                    <li>Вести себя агрессивно или оскорбительно</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    6. Создание объявлений о поездках
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
                    6.1. Типы поездок
                </h3>
                <p className="mb-3">
                    Платформа поддерживает два типа объявлений:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                        <strong>Объявление водителя:</strong> Водитель предлагает
                        свободные места в своем автомобиле
                    </li>
                    <li>
                        <strong>Объявление пассажира:</strong> Пассажир ищет
                        поездку по нужному маршруту
                    </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                    6.2. Обязательная информация
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Точка отправления и назначения</li>
                    <li>Дата и время поездки</li>
                    <li>Стоимость поездки</li>
                    <li>
                        Количество мест (для водителей) или пассажиров (для
                        пассажиров)
                    </li>
                    <li>Контактный номер телефона</li>
                    <li>Для водителей: информация об автомобиле</li>
                </ul>

                <p className="mt-4 text-sm italic border-l-4 border-amber-500 pl-4 py-1 bg-amber-50">
                    Все объявления должны содержать правдивую информацию.
                    Размещение заведомо ложных объявлений является основанием для
                    блокировки учетной записи.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    7. Оплата и расчеты
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                        Стоимость поездки согласовывается напрямую между
                        водителем и пассажиром
                    </li>
                    <li>
                        Платформа BulBul Go не участвует в финансовых расчетах
                        между пользователями
                    </li>
                    <li>
                        Способ оплаты (наличные, перевод) определяется по
                        взаимному согласию
                    </li>
                    <li>
                        Мы не несем ответственности за споры, связанные с оплатой
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    8. Ответственность и ограничения
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
                    8.1. Роль BulBul Go
                </h3>
                <p className="mb-3">BulBul Go является посредником и:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                        Не является участником договора между водителем и
                        пассажиром
                    </li>
                    <li>
                        Не проверяет квалификацию водителей или техническое
                        состояние автомобилей
                    </li>
                    <li>Не несет ответственности за действия пользователей</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                    8.2. Ответственность пользователей
                </h3>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="font-semibold text-red-900">Важно!</p>
                    <p className="text-red-800 mt-2">
                        Пользователи несут полную ответственность за:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-red-800">
                        <li>Соблюдение законодательства</li>
                        <li>Безопасность во время поездки</li>
                        <li>
                            Ущерб, причиненный другим пользователям или третьим
                            лицам
                        </li>
                        <li>Качество предоставляемых услуг</li>
                    </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                    8.3. Ограничение ответственности Платформы
                </h3>
                <p>BulBul Go не несет ответственности за:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                        Несчастные случаи, травмы или ущерб во время поездок
                    </li>
                    <li>Потерю или повреждение имущества</li>
                    <li>Неисполнение обязательств пользователями</li>
                    <li>Недостоверность информации в объявлениях</li>
                    <li>Сбои в работе Платформы по техническим причинам</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    9. Запрещенное использование
                </h2>
                <p className="mb-3">
                    При использовании Платформы запрещается:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Нарушать законодательство</li>
                    <li>
                        Размещать ложную или вводящую в заблуждение информацию
                    </li>
                    <li>
                        Использовать Платформу в коммерческих целях без
                        согласования
                    </li>
                    <li>Размещать спам или рекламные материалы</li>
                    <li>
                        Осуществлять несанкционированный доступ к системам
                        Платформы
                    </li>
                    <li>
                        Использовать автоматизированные средства для сбора данных
                    </li>
                    <li>Выдавать себя за другое лицо</li>
                    <li>
                        Размещать материалы оскорбительного, дискриминационного
                        или незаконного характера
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    10. Блокировка и удаление учетной записи
                </h2>
                <p className="mb-3">
                    Мы оставляем за собой право заблокировать или удалить учетную
                    запись при:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Нарушении настоящих Условий использования</li>
                    <li>
                        Получении обоснованных жалоб от других пользователей
                    </li>
                    <li>Подозрении в мошеннических действиях</li>
                    <li>Длительном неиспользовании (более 2 лет)</li>
                </ul>
                <p className="mt-3">
                    Пользователь может самостоятельно удалить свою учетную запись
                    в любое время через настройки профиля.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    11. Интеллектуальная собственность
                </h2>
                <p>
                    Все права на Платформу BulBul Go, включая дизайн,
                    программное обеспечение, логотипы и контент, принадлежат
                    оператору сервиса. Запрещается копирование, изменение или
                    использование материалов Платформы без письменного
                    разрешения.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    12. Изменения в Условиях
                </h2>
                <p>
                    Мы можем изменять настоящие Условия в любое время. О
                    существенных изменениях мы уведомим вас по электронной почте
                    или через уведомление в приложении за 7 дней до вступления
                    изменений в силу. Продолжение использования Платформы после
                    изменений означает ваше согласие с новыми Условиями.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    13. Разрешение споров
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Споры между пользователями решаются самостоятельно</li>
                    <li>
                        При невозможности урегулирования, споры рассматриваются в
                        соответствии с законодательством
                    </li>
                    <li>
                        Претензии к Платформе направляются на email:{' '}
                        <a
                            href="mailto:support@bulbulgo.com"
                            className="text-blue-600 hover:underline"
                        >
                            support@bulbulgo.com
                        </a>
                    </li>
                    <li>Срок рассмотрения претензий — 14 рабочих дней</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    14. Контакты и реквизиты
                </h2>
                <OperatorDetails />
            </section>

            <section className="border-t border-gray-200 pt-6">
                <p className="text-center text-gray-600 italic">
                    Используя BulBul Go, вы подтверждаете, что прочитали, поняли
                    и согласны с настоящими Условиями использования.
                </p>
                <p className="text-center text-gray-600 mt-2">
                    Желаем вам приятных и безопасных поездок!
                </p>
            </section>
        </div>
    )
}

export default function PolicyPage({
    title,
    type,
}: {
    title: string
    type: 'privacy' | 'terms'
}) {
    return (
        <section className="py-20 bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-10 flex items-center">
                    <FileText className="mr-4 text-blue-600" /> {title}
                </h1>
                <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                    {type === 'privacy' ? <PrivacyContent /> : <TermsContent />}
                </div>
            </div>
        </section>
    )
}
