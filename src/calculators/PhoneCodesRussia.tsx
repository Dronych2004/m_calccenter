/**
 * Справочник телефонных кодов России
 *
 * Источник: Wikipedia "Telephone numbers in Russia"
 * Коды регионов подтверждены official numbering plan.
 *
 * Формат: +7 XXX xxx-xx-xx
 * XXX — код региона (3 цифры), далее — номер абонента.
 */
import { useState, useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface CityCode {
  city: string;
  cityEn: string;
  code: string;
  region: string;
  regionEn: string;
  federalDistrict: string;
  federalDistrictEn: string;
}

const phoneCodes: CityCode[] = [
  /* ===== ЦЕНТРАЛЬНЫЙ ФО ===== */
  { city: 'Москва', cityEn: 'Moscow', code: '495', region: 'г. Москва', regionEn: 'Moscow City', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Москва (обл.)', cityEn: 'Moscow (region)', code: '496', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Белгород', cityEn: 'Belgorod', code: '472', region: 'Белгородская область', regionEn: 'Belgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Старый Оскол', cityEn: 'Stary Oskol', code: '47253', region: 'Белгородская область', regionEn: 'Belgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Губкин', cityEn: 'Gubkin', code: '47241', region: 'Белгородская область', regionEn: 'Belgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Валуйки', cityEn: 'Valuiki', code: '47236', region: 'Белгородская область', regionEn: 'Belgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Алексеевка', cityEn: 'Alekseevka', code: '47242', region: 'Белгородская область', regionEn: 'Belgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Бирюч', cityEn: 'Biryuch', code: '47247', region: 'Белгородская область', regionEn: 'Belgorod Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  { city: 'Брянск', cityEn: 'Bryansk', code: '483', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Клинцы', cityEn: 'Klintsy', code: '48336', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Унеча', cityEn: 'Unecha', code: '48331', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Новозыбков', cityEn: 'Novozybkov', code: '48343', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Дятьково', cityEn: 'Dyatkovo', code: '48333', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Жуковка', cityEn: 'Zhukovka', code: '48334', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Севск', cityEn: 'Sevsk', code: '48332', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Карачев', cityEn: 'Karachev', code: '48335', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Новозыбков', cityEn: 'Novozybkov', code: '48343', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  { city: 'Курск', cityEn: 'Kursk', code: '471', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Льгов', cityEn: 'Lgov', code: '47149', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Железногорск', cityEn: 'Zheleznogorsk', code: '47148', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Рыльск', cityEn: 'Rylsk', code: '47152', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Суджа', cityEn: 'Sudzha', code: '47158', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Фатеж', cityEn: 'Fatezh', code: '47154', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Щигры', cityEn: 'Shchigry', code: '47156', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Обоянь', cityEn: 'Oboyan', code: '47151', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Курчатов', cityEn: 'Kurchatov', code: '47147', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  { city: 'Липецк', cityEn: 'Lipetsk', code: '474', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Елец', cityEn: 'Yelets', code: '47467', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Данков', cityEn: 'Dankov', code: '47465', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Грязи', cityEn: 'Gryazi', code: '47461', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Добринка', cityEn: 'Dobrinka', code: '47462', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Лебедянь', cityEn: 'Lebedyan', code: '47466', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Усмань', cityEn: 'Usman', code: '47472', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Задонск', cityEn: 'Zadonsk', code: '47468', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Долгоруково', cityEn: 'Dolgorukovo', code: '47463', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Измалково', cityEn: 'Izmalkovo', code: '47464', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  { city: 'Орёл', cityEn: 'Oryol', code: '486', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ливны', cityEn: 'Livny', code: '48668', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Мценск', cityEn: 'Mtsensk', code: '48671', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Болхов', cityEn: 'Bolkhov', code: '48663', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Новосиль', cityEn: 'Novosil', code: '48673', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Дмитровск-Орловский', cityEn: 'Dmitrovsk-Oryolsky', code: '48664', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Малоархангельск', cityEn: 'Maloarkhangelsk', code: '48670', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Знаменка', cityEn: 'Znamenka', code: '48665', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  { city: 'Рязань', cityEn: 'Ryazan', code: '491', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Касимов', cityEn: 'Kasimov', code: '49162', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Скопин', cityEn: 'Skopin', code: '49161', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ряжск', cityEn: 'Ryazhsk', code: '49155', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Мичуринск', cityEn: 'Michurinsk', code: '49156', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Рыбное', cityEn: 'Rybnoye', code: '49137', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кораблино', cityEn: 'Korablino', code: '49164', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Новомичуринск', cityEn: 'Novomichurinsk', code: '49161', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  { city: 'Смоленск', cityEn: 'Smolensk', code: '481', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Вязьма', cityEn: 'Vyazma', code: '48131', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Рославль', cityEn: 'Roslavl', code: '48133', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Гагарин', cityEn: 'Gagarin', code: '48132', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Десногорск', cityEn: 'Desnogorsk', code: '48134', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ярцево', cityEn: 'Yartsevo', code: '48136', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Сафоново', cityEn: 'Safonovo', code: '48135', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Рудня', cityEn: 'Rudnya', code: '48137', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Дорогобуж', cityEn: 'Dorogobuzh', code: '48139', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ельня', cityEn: 'Yelnya', code: '48138', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Сычёвка', cityEn: 'Sychevka', code: '48130', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Велиж', cityEn: 'Velizh', code: '48132', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  { city: 'Тамбов', cityEn: 'Tambov', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Мичуринск', cityEn: 'Michurinsk', code: '47544', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кирсанов', cityEn: 'Kirsanov', code: '47533', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Моршанск', cityEn: 'Morshansk', code: '47536', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Уварово', cityEn: 'Uvarovo', code: '47558', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Жердевка', cityEn: 'Zherdevka', code: '47542', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Рассказово', cityEn: 'Rasskazovo', code: '47555', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  { city: 'Тверь', cityEn: 'Tver', code: '482', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Торжок', cityEn: 'Torzhok', code: '48251', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Вышний Волочёк', cityEn: 'Vyshny Volochyok', code: '48233', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ржев', cityEn: 'Rzhev', code: '48231', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кимры', cityEn: 'Kimry', code: '48236', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Бежецк', cityEn: 'Bezhetsk', code: '48231', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кашин', cityEn: 'Kashin', code: '48235', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Конаково', cityEn: 'Konakovo', code: '48237', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Удомля', cityEn: 'Udomlya', code: '48234', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Бологое', cityEn: 'Bologoye', code: '48238', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Лихославль', cityEn: 'Likhoslavl', code: '48241', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Западная Двина', cityEn: 'Zapadnaya Dvina', code: '48244', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Осташков', cityEn: 'Ostashkov', code: '48232', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Торопец', cityEn: 'Toropets', code: '48246', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Пено', cityEn: 'Peno', code: '48248', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кувшиново', cityEn: 'Kuvshinovo', code: '48242', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Весьегонск', cityEn: 'Vesyegonsk', code: '48245', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Максатиха', cityEn: 'Maksatikha', code: '48243', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Красный Холм', cityEn: 'Krasny Kholm', code: '48247', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Селижарово', cityEn: 'Selizharovo', code: '48249', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Фирово', cityEn: 'Firovo', code: '48250', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  { city: 'Ярославль', cityEn: 'Yaroslavl', code: '485', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Рыбинск', cityEn: 'Rybinsk', code: '48552', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Переславль-Залесский', cityEn: 'Pereslavl-Zalessky', code: '48534', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Тутаев', cityEn: 'Tutaev', code: '48533', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Углич', cityEn: 'Uglich', code: '48532', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Мышкин', cityEn: 'Myshkin', code: '48535', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Данилов', cityEn: 'Danilov', code: '48536', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Любим', cityEn: 'Lyubim', code: '48537', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Пошехонье', cityEn: 'Poshekhonye', code: '48538', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Гаврилов-Ям', cityEn: 'Gavrilov-Yam', code: '48531', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Брянск', cityEn: 'Bryansk', code: '483', region: 'Брянская область', regionEn: 'Bryansk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Владимир', cityEn: 'Vladimir', code: '492', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Воронеж', cityEn: 'Voronezh', code: '473', region: 'Воронежская область', regionEn: 'Voronezh Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Иваново', cityEn: 'Ivanovo', code: '493', region: 'Ивановская область', regionEn: 'Ivanovo Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Калуга', cityEn: 'Kaluga', code: '484', region: 'Калужская область', regionEn: 'Kaluga Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кострома', cityEn: 'Kostroma', code: '494', region: 'Костромская область', regionEn: 'Kostroma Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Курск', cityEn: 'Kursk', code: '471', region: 'Курская область', regionEn: 'Kursk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Липецк', cityEn: 'Lipetsk', code: '474', region: 'Липецкая область', regionEn: 'Lipetsk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Орёл', cityEn: 'Oryol', code: '486', region: 'Орловская область', regionEn: 'Oryol Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Рязань', cityEn: 'Ryazan', code: '491', region: 'Рязанская область', regionEn: 'Ryazan Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Смоленск', cityEn: 'Smolensk', code: '481', region: 'Смоленская область', regionEn: 'Smolensk Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Тамбов', cityEn: 'Tambov', code: '475', region: 'Тамбовская область', regionEn: 'Tambov Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Тула', cityEn: 'Tula', code: '487', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Тверь', cityEn: 'Tver', code: '482', region: 'Тверская область', regionEn: 'Tver Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ярославль', cityEn: 'Yaroslavl', code: '485', region: 'Ярославская область', regionEn: 'Yaroslavl Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  /* ===== СЕВЕРО-ЗАПАДНЫЙ ФО ===== */
  { city: 'Санкт-Петербург', cityEn: 'Saint Petersburg', code: '812', region: 'г. Санкт-Петербург', regionEn: 'Saint Petersburg', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Архангельск', cityEn: 'Arkhangelsk', code: '818', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Великий Новгород', cityEn: 'Veliky Novgorod', code: '816', region: 'Новгородская область', regionEn: 'Novgorod Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Вологда', cityEn: 'Vologda', code: '817', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Калининград', cityEn: 'Kaliningrad', code: '401', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Петрозаводск', cityEn: 'Petrozavodsk', code: '814', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Псков', cityEn: 'Pskov', code: '811', region: 'Псковская область', regionEn: 'Pskov Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Мурманск', cityEn: 'Murmansk', code: '815', region: 'Мурманская область', regionEn: 'Murmansk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сыктывкар', cityEn: 'Syktyvkar', code: '821', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Череповец', cityEn: 'Cherepovets', code: '820', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Ленобласть', cityEn: 'Leningrad Oblast', code: '813', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },

  /* ===== ЮЖНЫЙ ФО ===== */
  { city: 'Краснодар', cityEn: 'Krasnodar', code: '861', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Ростов-на-Дону', cityEn: 'Rostov-on-Don', code: '863', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Волгоград', cityEn: 'Volgograd', code: '844', region: 'Волгоградская область', regionEn: 'Volgograd Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Астрахань', cityEn: 'Astrakhan', code: '851', region: 'Астраханская область', regionEn: 'Astrakhan Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Симферополь', cityEn: 'Simferopol', code: '365', region: 'Республика Крым', regionEn: 'Republic of Crimea', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Севастополь', cityEn: 'Sevastopol', code: '869', region: 'г. Севастополь', regionEn: 'Sevastopol', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },

  /* ===== СЕВЕРО-КАВКАЗСКИЙ ФО ===== */
  { city: 'Махачкала', cityEn: 'Makhachkala', code: '872', region: 'Республика Дагестан', regionEn: 'Republic of Dagestan', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Нальчик', cityEn: 'Nalchik', code: '866', region: 'Кабардино-Балкарская Республика', regionEn: 'Kabardino-Balkarian Republic', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Ставрополь', cityEn: 'Stavropol', code: '865', region: 'Ставропольский край', regionEn: 'Stavropol Krai', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Владикавказ', cityEn: 'Vladikavkaz', code: '867', region: 'Республика Северная Осетия', regionEn: 'Republic of North Ossetia', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },

  /* ===== ПРИВОЛЖСКИЙ ФО ===== */
  { city: 'Нижний Новгород', cityEn: 'Nizhny Novgorod', code: '831', region: 'Нижегородская область', regionEn: 'Nizhny Novgorod Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Казань', cityEn: 'Kazan', code: '843', region: 'Республика Татарстан', regionEn: 'Republic of Tatarstan', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Самара', cityEn: 'Samara', code: '846', region: 'Самарская область', regionEn: 'Samara Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Уфа', cityEn: 'Ufa', code: '347', region: 'Республика Башкортостан', regionEn: 'Republic of Bashkortostan', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Оренбург', cityEn: 'Orenburg', code: '353', region: 'Оренбургская область', regionEn: 'Orenburg Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Пермь', cityEn: 'Perm', code: '342', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Саратов', cityEn: 'Saratov', code: '845', region: 'Саратовская область', regionEn: 'Saratov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Тольятти', cityEn: 'Tolyatti', code: '848', region: 'Самарская область', regionEn: 'Samara Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Ижевск', cityEn: 'Izhevsk', code: '341', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Пенза', cityEn: 'Penza', code: '841', region: 'Пензенская область', regionEn: 'Penza Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Киров', cityEn: 'Kirov', code: '833', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Ульяновск', cityEn: 'Ulyanovsk', code: '842', region: 'Ульяновская область', regionEn: 'Ulyanovsk Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Чебоксары', cityEn: 'Cheboksary', code: '835', region: 'Чувашская Республика', regionEn: 'Chuvash Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Йошкар-Ола', cityEn: 'Yoshkar-Ola', code: '836', region: 'Республика Марий Эл', regionEn: 'Mari El Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Саранск', cityEn: 'Saransk', code: '834', region: 'Республика Мордовия', regionEn: 'Republic of Mordovia', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },

  /* ===== УРАЛЬСКИЙ ФО ===== */
  { city: 'Екатеринбург', cityEn: 'Yekaterinburg', code: '343', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Челябинск', cityEn: 'Chelyabinsk', code: '351', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Тюмень', cityEn: 'Tyumen', code: '345', region: 'Тюменская область', regionEn: 'Tyumen Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Курган', cityEn: 'Kurgan', code: '352', region: 'Курганская область', regionEn: 'Kurgan Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },

  /* ===== СИБИРСКИЙ ФО ===== */
  { city: 'Новосибирск', cityEn: 'Novosibirsk', code: '383', region: 'Новосибирская область', regionEn: 'Novosibirsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Красноярск', cityEn: 'Krasnoyarsk', code: '391', region: 'Красноярский край', regionEn: 'Krasnoyarsk Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Омск', cityEn: 'Omsk', code: '381', region: 'Омская область', regionEn: 'Omsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Барнаул', cityEn: 'Barnaul', code: '385', region: 'Алтайский край', regionEn: 'Altai Krai', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Иркутск', cityEn: 'Irkutsk', code: '395', region: 'Иркутская область', regionEn: 'Irkutsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кемерово', cityEn: 'Kemerovo', code: '384', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Томск', cityEn: 'Tomsk', code: '382', region: 'Томская область', regionEn: 'Tomsk Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Горно-Алтайск', cityEn: 'Gorno-Altaysk', code: '388', region: 'Республика Алтай', regionEn: 'Altai Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Кызыл', cityEn: 'Kyzyl', code: '394', region: 'Республика Тыва', regionEn: 'Tuva Republic', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Абакан', cityEn: 'Abakan', code: '390', region: 'Республика Хакасия', regionEn: 'Republic of Khakassia', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },

  /* ===== ДАЛЬНЕВОСТОЧНЫЙ ФО ===== */
  { city: 'Владивосток', cityEn: 'Vladivostok', code: '423', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Хабаровск', cityEn: 'Khabarovsk', code: '421', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Якутск', cityEn: 'Yakutsk', code: '411', region: 'Республика Саха (Якутия)', regionEn: 'Sakha Republic (Yakutia)', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Петропавловск-Камчатский', cityEn: 'Petropavlovsk-Kamchatsky', code: '415', region: 'Камчатский край', regionEn: 'Kamchatka Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Чита', cityEn: 'Chita', code: '302', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Краснокаменск', cityEn: 'Krasnokamensk', code: '30245', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Борзя', cityEn: 'Borzya', code: '30233', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Петровск-Забайкальский', cityEn: 'Petrovsk-Zabaykalsky', code: '30236', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Сретенск', cityEn: 'Sretensk', code: '30232', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Нерчинск', cityEn: 'Nerchinsk', code: '30242', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Кыра', cityEn: 'Kyra', code: '30235', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Могоча', cityEn: 'Mogocha', code: '30241', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Нерчинский Завод', cityEn: 'Nerchinsky Zavod', code: '30248', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Приаргунск', cityEn: 'Priargunsk', code: '30243', region: 'Забайкальский край', regionEn: 'Zabaykalsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Южно-Сахалинск', cityEn: 'Yuzhno-Sakhalinsk', code: '424', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Магадан', cityEn: 'Magadan', code: '413', region: 'Магаданская область', regionEn: 'Magadan Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Благовещенск', cityEn: 'Blagoveshchensk', code: '416', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Зея', cityEn: 'Zeya', code: '41658', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Белогорск', cityEn: 'Belogorsk', code: '41641', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Райчихинск', cityEn: 'Raychikhinsk', code: '41647', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Шимановск', cityEn: 'Shimanovsk', code: '41651', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Тында', cityEn: 'Tynda', code: '41656', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Новобурейск', cityEn: 'Novobureysk', code: '41634', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Улан-Удэ', cityEn: 'Ulan-Ude', code: '301', region: 'Республика Бурятия', regionEn: 'Republic of Buryatia', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Биробиджан', cityEn: 'Birobidzhan', code: '426', region: 'Еврейская автономная область', regionEn: 'Jewish Autonomous Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Анадырь', cityEn: 'Anadyr', code: '427', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Салехард', cityEn: 'Salekhard', code: '349', region: 'Ямало-Ненецкий АО', regionEn: 'Yamalo-Nenets AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },

  /* ===== РЕСПУБЛИКИ СЕВЕРНОГО КАВКАЗА ===== */
  { city: 'Грозный', cityEn: 'Grozny', code: '871', region: 'Чеченская Республика', regionEn: 'Chechen Republic', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Майкоп', cityEn: 'Maykop', code: '877', region: 'Республика Адыгея', regionEn: 'Republic of Adygea', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Элиста', cityEn: 'Elista', code: '847', region: 'Республика Калмыкия', regionEn: 'Republic of Kalmykia', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Черкесск', cityEn: 'Cherkessk', code: '878', region: 'Карачаево-Черкесская Республика', regionEn: 'Karachay-Cherkess Republic', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },

  /* ===== ЧУКОТСКИЙ АО ===== */
  { city: 'Певек', cityEn: 'Pevek', code: '42737', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Билибино', cityEn: 'Bilibino', code: '42738', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Анадырь', cityEn: 'Anadyr', code: '427', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Провидения', cityEn: 'Provideniya', code: '42735', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Угольные Копи', cityEn: 'Ugolnye Kopi', code: '42732', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Эгвекинот', cityEn: 'Egvekinot', code: '42734', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Лаврентия', cityEn: 'Lavrentiya', code: '42736', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Мыс Шмидта', cityEn: 'Mys Shmidta', code: '42739', region: 'Чукотский АО', regionEn: 'Chukotka AO', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },

  /* ===== ВЛАДИМИРСКАЯ ОБЛАСТЬ ===== */
  { city: 'Петушки', cityEn: 'Petushki', code: '49243', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Муром', cityEn: 'Murom', code: '49234', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ковров', cityEn: 'Kovrov', code: '49232', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Александров', cityEn: 'Aleksandrov', code: '49244', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Гусь-Хрустальный', cityEn: 'Gus-Khrustalny', code: '49241', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Вязники', cityEn: 'Vyazniki', code: '49233', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Киржач', cityEn: 'Kirzhach', code: '49237', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Собинка', cityEn: 'Sobinka', code: '49242', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Лакинск', cityEn: 'Lakinsk', code: '49246', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Гороховец', cityEn: 'Gorokhovets', code: '49238', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Камешково', cityEn: 'Kameshkovo', code: '49249', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Меленки', cityEn: 'Melenki', code: '49247', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Покров', cityEn: 'Pokrov', code: '49248', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Радужный', cityEn: 'Raduzhny', code: '49254', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Судогда', cityEn: 'Sudogda', code: '49235', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Суздаль', cityEn: 'Suzdal', code: '49231', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Юрьев-Польский', cityEn: 'Yuryev-Polsky', code: '49246', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кольчугино', cityEn: 'Kolchugino', code: '49245', region: 'Владимирская область', regionEn: 'Vladimir Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },

  /* ===== АМУРСКАЯ ОБЛАСТЬ ===== */
  { city: 'Зея', cityEn: 'Zeya', code: '41658', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Белогорск', cityEn: 'Belogorsk', code: '41641', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Райчихинск', cityEn: 'Raychikhinsk', code: '41647', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Шимановск', cityEn: 'Shimanovsk', code: '41651', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Тында', cityEn: 'Tynda', code: '41656', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Свободный', cityEn: 'Svobodny', code: '41642', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Сковородино', cityEn: 'Skovorodino', code: '41636', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Завитинск', cityEn: 'Zavitinsk', code: '41632', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Магдагачи', cityEn: 'Magdagachi', code: '41637', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Ромны', cityEn: 'Romny', code: '41635', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Поярково', cityEn: 'Poyarkovo', code: '41633', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Ивановка', cityEn: 'Ivanovka', code: '41631', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Константиновка', cityEn: 'Konstantinovka', code: '41630', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Тамбовка', cityEn: 'Tambovka', code: '41638', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Архара', cityEn: 'Arkharа', code: '41639', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Новобурейск', cityEn: 'Novobureysk', code: '41634', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Серышево', cityEn: 'Seryshevo', code: '41644', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Февральск', cityEn: 'Fevralsk', code: '41645', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Экимчан', cityEn: 'Ekimchan', code: '41649', region: 'Амурская область', regionEn: 'Amur Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },

  /* ===== АВТОНОМНЫЕ ОКРУГА И ОБЛАСТИ ===== */
  { city: 'Ханты-Мансийск', cityEn: 'Khanty-Mansiysk', code: '346', region: 'Ханты-Мансийский АО — Югра', regionEn: 'Khanty-Mansi AO — Yugra', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Надым', cityEn: 'Nadym', code: '349', region: 'Ямало-Ненецкий АО', regionEn: 'Yamalo-Nenets AO', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Нарьян-Мар', cityEn: 'Naryan-Mar', code: '818', region: 'Ненецкий АО', regionEn: 'Nenets AO', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },

  /* ===== ГОРОДА С ВНУТРЕННИМИ КОДАМИ (проверено kody.su) ===== */
  /* Тульская область */
  { city: 'Донской', cityEn: 'Donskoy', code: '48746', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ефремов', cityEn: 'Efremov', code: '48741', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Новомосковск', cityEn: 'Novomoskovsk', code: '48762', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Узловая', cityEn: 'Uzlovaya', code: '48753', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кимовск', cityEn: 'Kimovsk', code: '48756', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Суворов', cityEn: 'Suvorov', code: '48766', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Киреевск', cityEn: 'Kireyevsk', code: '48755', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Богородицк', cityEn: 'Bogoroditsk', code: '48754', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Дубна (Тульская обл.)', cityEn: 'Dubna (Tula)', code: '48752', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Плавск', cityEn: 'Plavsk', code: '48759', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Чернь', cityEn: 'Chern', code: '48758', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Щёкино', cityEn: 'Shchyokino', code: '48757', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ясногорск', cityEn: 'Yasnogorsk', code: '48759', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ленинский (Тульская обл.)', cityEn: 'Leninsky (Tula)', code: '48753', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Заокский', cityEn: 'Zaoksky', code: '48759', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Куркино', cityEn: 'Kurkino', code: '48758', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Теплое', cityEn: 'Teploye', code: '48758', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Одоев', cityEn: 'Odoev', code: '48757', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Венёв', cityEn: 'Venev', code: '48753', region: 'Тульская область', regionEn: 'Tula Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  /* Калужская область */
  { city: 'Обнинск', cityEn: 'Obninsk', code: '48446', region: 'Калужская область', regionEn: 'Kaluga Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Людиново', cityEn: 'Lyudinovo', code: '48445', region: 'Калужская область', regionEn: 'Kaluga Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Козельск', cityEn: 'Kozelsk', code: '48456', region: 'Калужская область', regionEn: 'Kaluga Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Сухиничи', cityEn: 'Sukhinichi', code: '48448', region: 'Калужская область', regionEn: 'Kaluga Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Малоярославец', cityEn: 'Maloyaroslavets', code: '48447', region: 'Калужская область', regionEn: 'Kaluga Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  /* Московская область */
  { city: 'Химки', cityEn: 'Khimki', code: '498', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Балашиха', cityEn: 'Balashikha', code: '49652', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Мытищи', cityEn: 'Mytishchi', code: '49648', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Люберцы', cityEn: 'Lyubertsy', code: '49656', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Подольск', cityEn: 'Podolsk', code: '49676', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Домодедово', cityEn: 'Domodedovo', code: '49679', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Одинцово', cityEn: 'Odintsovo', code: '49671', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Долгопрудный', cityEn: 'Dolgoprudny', code: '49597', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Красногорск', cityEn: 'Krasnogorsk', code: '49596', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Дмитров', cityEn: 'Dmitrov', code: '49622', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Коломна', cityEn: 'Kolomna', code: '49676', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Сергиев Посад', cityEn: 'Sergiyev Posad', code: '49654', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Серпухов', cityEn: 'Serpukhov', code: '49676', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ногинск', cityEn: 'Noginsk', code: '49652', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Орехово-Зуево', cityEn: 'Orekhovo-Zuyevo', code: '49672', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Электросталь', cityEn: 'Elektrostal', code: '49657', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Жуковский', cityEn: 'Zhukovsky', code: '49648', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Воскресенск', cityEn: 'Voskresensk', code: '49672', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Лобня', cityEn: 'Lobnya', code: '49671', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Ступино', cityEn: 'Stupino', code: '49676', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Чехов', cityEn: 'Chekhov', code: '49676', region: 'Московская область', regionEn: 'Moscow Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  /* Ленинградская область */
  { city: 'Выборг', cityEn: 'Vyborg', code: '81373', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Гатчина', cityEn: 'Gatchina', code: '81371', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кингисепп', cityEn: 'Kingisepp', code: '81375', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Тосно', cityEn: 'Tosno', code: '81372', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Всеволожск', cityEn: 'Vsevolozhsk', code: '81370', region: 'Ленинградская область', regionEn: 'Leningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  /* Калининградская область */
  { city: 'Балтийск', cityEn: 'Baltiysk', code: '40145', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Черняховск', cityEn: 'Chernyakhovsk', code: '40141', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Советск', cityEn: 'Sovetsk', code: '40161', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Гурьевск', cityEn: 'Guryevsk', code: '40151', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Гусев', cityEn: 'Gusev', code: '40142', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Багратионовск', cityEn: 'Bagrationovsk', code: '40143', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Неман', cityEn: 'Neman', code: '40146', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Полесск', cityEn: 'Polessk', code: '40146', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Правдинск', cityEn: 'Pravdinsk', code: '40144', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Зеленоградск', cityEn: 'Zelenogradsk', code: '40150', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Светлогорск', cityEn: 'Svetlogorsk', code: '40150', region: 'Калининградская область', regionEn: 'Kaliningrad Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  /* Ростовская область */
  { city: 'Шахты', cityEn: 'Shakhty', code: '86362', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Батайск', cityEn: 'Bataysk', code: '86393', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Новочеркасск', cityEn: 'Novocherkassk', code: '86392', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Таганрог', cityEn: 'Taganrog', code: '86346', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Белая Калитва', cityEn: 'Belaya Kalitva', code: '86383', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Гуково', cityEn: 'Gukovo', code: '86362', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Красный Сулин', cityEn: 'Krasny Sulin', code: '86367', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Сальск', cityEn: 'Salsk', code: '86372', region: 'Ростовская область', regionEn: 'Rostov Oblast', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  /* Воронежская область */
  { city: 'Борисоглебск', cityEn: 'Borisoglebsk', code: '47354', region: 'Воронежская область', regionEn: 'Voronezh Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Лиски', cityEn: 'Liski', code: '47391', region: 'Воронежская область', regionEn: 'Voronezh Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Богучар', cityEn: 'Boguchar', code: '47346', region: 'Воронежская область', regionEn: 'Voronezh Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Россошь', cityEn: 'Rossosh', code: '47374', region: 'Воронежская область', regionEn: 'Voronezh Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Нововоронеж', cityEn: 'Novovoronezh', code: '47370', region: 'Воронежская область', regionEn: 'Voronezh Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  /* Краснодарский край */
  { city: 'Сочи', cityEn: 'Sochi', code: '86224', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Геленджик', cityEn: 'Gelendzhik', code: '86141', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Анапа', cityEn: 'Anapa', code: '86133', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  { city: 'Армавир', cityEn: 'Armavir', code: '86131', region: 'Краснодарский край', regionEn: 'Krasnodar Krai', federalDistrict: 'Южный', federalDistrictEn: 'Southern' },
  /* Челябинская область */
  { city: 'Миасс', cityEn: 'Miass', code: '35137', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Златоуст', cityEn: 'Zlatoust', code: '35136', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Магнитогорск', cityEn: 'Magnitogorsk', code: '35191', region: 'Челябинская область', regionEn: 'Chelyabinsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  /* Свердловская область */
  { city: 'Нижний Тагил', cityEn: 'Nizhny Tagil', code: '34353', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Каменск-Уральский', cityEn: 'Kamensk-Uralsky', code: '34393', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Первоуральск', cityEn: 'Pervouralsk', code: '34375', region: 'Свердловская область', regionEn: 'Sverdlovsk Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  /* Кемеровская область */
  { city: 'Новокузнецк', cityEn: 'Novokuznetsk', code: '38432', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Прокопьевск', cityEn: 'Prokopyevsk', code: '38463', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Юрга', cityEn: 'Yurga', code: '38451', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Белово', cityEn: 'Belovo', code: '38452', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  { city: 'Киселёвск', cityEn: 'Kiselevsk', code: '38464', region: 'Кемеровская область', regionEn: 'Kemerovo Oblast', federalDistrict: 'Сибирский', federalDistrictEn: 'Siberian' },
  /* Приморский край */
  { city: 'Находка', cityEn: 'Nakhodka', code: '42366', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Уссурийск', cityEn: 'Ussuriysk', code: '42341', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Артём', cityEn: 'Artyom', code: '42337', region: 'Приморский край', regionEn: 'Primorsky Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  /* Хабаровский край */
  { city: 'Комсомольск-на-Амуре', cityEn: 'Komsomolsk-on-Amur', code: '42175', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Амурск', cityEn: 'Amursk', code: '42149', region: 'Хабаровский край', regionEn: 'Khabarovsk Krai', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  /* Сахалинская область */
  { city: 'Корсаков', cityEn: 'Korsakov', code: '42435', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Холмск', cityEn: 'Kholmsk', code: '42433', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  { city: 'Оха', cityEn: 'Okha', code: '42439', region: 'Сахалинская область', regionEn: 'Sakhalin Oblast', federalDistrict: 'Дальневосточный', federalDistrictEn: 'Far Eastern' },
  /* Чеченская Республика */
  { city: 'Гудермес', cityEn: 'Gudermes', code: '87152', region: 'Чеченская Республика', regionEn: 'Chechen Republic', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  /* Республика Дагестан */
  { city: 'Каспийск', cityEn: 'Kaspiysk', code: '87231', region: 'Республика Дагестан', regionEn: 'Republic of Dagestan', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Дербент', cityEn: 'Derbent', code: '87232', region: 'Республика Дагестан', regionEn: 'Republic of Dagestan', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Хасавюрт', cityEn: 'Khasavyurt', code: '87235', region: 'Республика Дагестан', regionEn: 'Republic of Dagestan', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  /* Ставропольский край */
  { city: 'Пятигорск', cityEn: 'Pyatigorsk', code: '87931', region: 'Ставропольский край', regionEn: 'Stavropol Krai', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Кисловодск', cityEn: 'Kislovodsk', code: '87937', region: 'Ставропольский край', regionEn: 'Stavropol Krai', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Ессентуки', cityEn: 'Yessentuki', code: '87934', region: 'Ставропольский край', regionEn: 'Stavropol Krai', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  { city: 'Минеральные Воды', cityEn: 'Mineralnye Vody', code: '87933', region: 'Ставропольский край', regionEn: 'Stavropol Krai', federalDistrict: 'Северо-Кавказский', federalDistrictEn: 'North Caucasian' },
  /* Пермский край */
  { city: 'Березники', cityEn: 'Berezniki', code: '34242', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Соликамск', cityEn: 'Solikamsk', code: '34253', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Чайковский', cityEn: 'Chaikovsky', code: '34241', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Кунгур', cityEn: 'Kungur', code: '34262', region: 'Пермский край', regionEn: 'Perm Krai', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  /* Удмуртская Республика */
  { city: 'Можга', cityEn: 'Mozhga', code: '34139', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Воткинск', cityEn: 'Votkinsk', code: '34145', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Сарапул', cityEn: 'Sarapul', code: '34147', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Глазов', cityEn: 'Glazov', code: '34141', region: 'Удмуртская Республика', regionEn: 'Udmurt Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  /* Республика Коми */
  { city: 'Воркута', cityEn: 'Vorkuta', code: '82151', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Ухта', cityEn: 'Ukhta', code: '82131', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Печора', cityEn: 'Pechora', code: '82141', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Инта', cityEn: 'Inta', code: '82145', region: 'Республика Коми', regionEn: 'Komi Republic', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  /* Архангельская область */
  { city: 'Котлас', cityEn: 'Kotlas', code: '81837', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Северодвинск', cityEn: 'Severodvinsk', code: '81845', region: 'Архангельская область', regionEn: 'Arkhangelsk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  /* Вологодская область */
  { city: 'Белозерск', cityEn: 'Belozersk', code: '81756', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Великий Устюг', cityEn: 'Veliky Ustyug', code: '81739', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сокол', cityEn: 'Sokol', code: '81733', region: 'Вологодская область', regionEn: 'Vologda Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  /* Республика Карелия */
  { city: 'Кондопога', cityEn: 'Kondopoga', code: '81451', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Сортавала', cityEn: 'Sortavala', code: '81430', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кемь', cityEn: 'Kem', code: '81859', region: 'Республика Карелия', regionEn: 'Republic of Karelia', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  /* Кировская область */
  { city: 'Кирово-Чепецк', cityEn: 'Kirovo-Chepetsk', code: '83361', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Слободской', cityEn: 'Slobodskoy', code: '83362', region: 'Кировская область', regionEn: 'Kirov Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  /* Чувашская Республика */
  { city: 'Алатырь', cityEn: 'Alatyr', code: '83531', region: 'Чувашская Республика', regionEn: 'Chuvash Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Канаш', cityEn: 'Kanash', code: '83532', region: 'Чувашская Республика', regionEn: 'Chuvash Republic', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  /* Оренбургская область */
  { city: 'Орск', cityEn: 'Orsk', code: '35371', region: 'Оренбургская область', regionEn: 'Orenburg Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  { city: 'Новотроицк', cityEn: 'Novotroitsk', code: '35376', region: 'Оренбургская область', regionEn: 'Orenburg Oblast', federalDistrict: 'Приволжский', federalDistrictEn: 'Volga' },
  /* Курганская область */
  { city: 'Шадринск', cityEn: 'Shadrinsk', code: '35253', region: 'Курганская область', regionEn: 'Kurgan Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  /* Тюменская область */
  { city: 'Тобольск', cityEn: 'Tobolsk', code: '34521', region: 'Тюменская область', regionEn: 'Tyumen Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Ишим', cityEn: 'Ishim', code: '34551', region: 'Тюменская область', regionEn: 'Tyumen Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  { city: 'Ялуторовск', cityEn: 'Yalutorovsk', code: '34541', region: 'Тюменская область', regionEn: 'Tyumen Oblast', federalDistrict: 'Уральский', federalDistrictEn: 'Urals' },
  /* Мурманская область */
  { city: 'Апатиты', cityEn: 'Apatity', code: '81531', region: 'Мурманская область', regionEn: 'Murmansk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Мончегорск', cityEn: 'Monchegorsk', code: '81536', region: 'Мурманская область', regionEn: 'Murmansk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Кандалакша', cityEn: 'Kandalaksha', code: '81533', region: 'Мурманская область', regionEn: 'Murmansk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  { city: 'Североморск', cityEn: 'Severomorsk', code: '81537', region: 'Мурманская область', regionEn: 'Murmansk Oblast', federalDistrict: 'Северо-Западный', federalDistrictEn: 'Northwestern' },
  /* Костромская область */
  { city: 'Буй', cityEn: 'Buy', code: '49438', region: 'Костромская область', regionEn: 'Kostroma Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Шарья', cityEn: 'Sharya', code: '49458', region: 'Костромская область', regionEn: 'Kostroma Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Галич', cityEn: 'Galich', code: '49441', region: 'Костромская область', regionEn: 'Kostroma Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  /* Ивановская область */
  { city: 'Кинешма', cityEn: 'Kineshma', code: '49343', region: 'Ивановская область', regionEn: 'Ivanovo Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Шуя', cityEn: 'Shuya', code: '49352', region: 'Ивановская область', regionEn: 'Ivanovo Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Вичуга', cityEn: 'Vichuga', code: '49341', region: 'Ивановская область', regionEn: 'Ivanovo Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
  { city: 'Кохма', cityEn: 'Kokhma', code: '49353', region: 'Ивановская область', regionEn: 'Ivanovo Oblast', federalDistrict: 'Центральный', federalDistrictEn: 'Central' },
];

export default function PhoneCodesRussia() {
  const [search, setSearch] = useState('');
  const lang = useLanguage();

  const grouped = useMemo(() => {
    const filtered = phoneCodes.filter((item) => {
      const query = search.toLowerCase();
      if (!query) return true;
      return (
        item.city.toLowerCase().includes(query) ||
        item.cityEn.toLowerCase().includes(query) ||
        item.code.includes(query) ||
        item.region.toLowerCase().includes(query) ||
        item.regionEn.toLowerCase().includes(query) ||
        item.federalDistrict.toLowerCase().includes(query) ||
        item.federalDistrictEn.toLowerCase().includes(query)
      );
    });

    const groups: Record<string, CityCode[]> = {};
    for (const item of filtered) {
      const district = lang === 'ru' ? item.federalDistrict : item.federalDistrictEn;
      if (!groups[district]) groups[district] = [];
      groups[district].push(item);
    }
    return groups;
  }, [search, lang]);

  const totalResults = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 animate-fade-in overflow-hidden">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          {lang === 'ru' ? 'Телефонные коды России' : 'Russia Phone Codes'}
        </h1>
        <p className="text-sm text-slate-400">
          {lang === 'ru' ? 'Коды регионов (формат: +7 XXX xxx-xx-xx)' : 'Region codes (format: +7 XXX xxx-xx-xx)'}
        </p>
      </div>

      {/* Поиск */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ru' ? 'Найти город или код...' : 'Find city or code...'}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-slate-700 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
        {search && (
          <p className="mt-2 text-xs text-slate-400">
            {lang === 'ru' ? `Найдено: ${totalResults}` : `Found: ${totalResults}`}
          </p>
        )}
      </div>

      {/* Результаты */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([district, cities]) => (
          <div key={district}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
              {district}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {cities.map((item, i) => (
                <div
                  key={`${item.code}-${item.city}-${i}`}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-indigo-50/50 transition-colors ${
                    i < cities.length - 1 ? 'border-b border-slate-50' : ''
                  }`}
                >
                  {/* Код */}
                  <span className="shrink-0 w-16 text-center text-lg font-bold text-indigo-600 bg-indigo-50 rounded-lg py-1.5 tabular-nums">
                    {item.code}
                  </span>
                  {/* Город и регион */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {lang === 'ru' ? item.city : item.cityEn}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {lang === 'ru' ? item.region : item.regionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <p className="text-sm text-slate-300">
              {lang === 'ru' ? 'Ничего не найдено' : 'Nothing found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}