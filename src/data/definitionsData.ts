// Definitions & Functional Semantic Comprehension Data (Désignation par Définition)
// Designed for Aphasia Rehabilitation (Auditory, Written, and Pictorial Functional Clues)

// School / Writing Items
import penImg from '../assets/images/single_pen_writing_1788122121779.jpg';
import eraserImg from '../assets/images/single_eraser_1788122135655.jpg';
import rulerImg from '../assets/images/single_ruler_1788122151080.jpg';
import sharpenerImg from '../assets/images/single_pencil_sharpener_1788508409870.jpg';
import scissorsImg from '../assets/images/single_scissors_1788122181005.jpg';
import toothbrushImg from '../assets/images/single_toothbrush_1788122193023.jpg';

// Kitchen & Home Items
import spoonImg from '../assets/images/single_spoon_1787600891188.jpg';
import cupImg from '../assets/images/single_cup_1787600877540.jpg';
import chairImg from '../assets/images/single_chair_1787600798384.jpg';
import tableImg from '../assets/images/single_table_1787600810905.jpg';
import bedImg from '../assets/images/single_bed_1787600822785.jpg';
import doorImg from '../assets/images/single_door_1787600833076.jpg';
import keyImg from '../assets/images/single_key_1787600855700.jpg';
import phoneImg from '../assets/images/single_phone_1787600866215.jpg';

// Clothes
import shoesImg from '../assets/images/clothes_shoes_real_1787743126569.jpg';
import hatImg from '../assets/images/clothes_hat_real_1787743178000.jpg';
import shirtImg from '../assets/images/clothes_shirt_real_1787743158319.jpg';
import pantsImg from '../assets/images/real_pants_clear_photo_1788966610499.jpg';
import coatImg from '../assets/images/warm_stylish_coat_1789857749444.jpg';

// Fruits & Food
import appleImg from '../assets/images/single_apple_1787586304712.jpg';
import bananaImg from '../assets/images/single_banana_1787586318769.jpg';
import lemonImg from '../assets/images/real_yellow_lemon_1788461696458.jpg';
import orangeImg from '../assets/images/single_orange_1787586292224.jpg';
import strawberryImg from '../assets/images/single_strawberry_1787586252050.jpg';

// Animals
import dogImg from '../assets/images/single_dog_1787601626990.jpg';
import catImg from '../assets/images/single_cat_1787601612744.jpg';
import sheepImg from '../assets/images/single_sheep_1787601641529.jpg';
import cowImg from '../assets/images/single_cow_1787683565892.jpg';

// Transport
import carImg from '../assets/images/real_car_photo_1788963932042.jpg';
import busImg from '../assets/images/real_bus_photo_1788963943781.jpg';
import bicycleImg from '../assets/images/real_bicycle_photo_1788963955298.jpg';
import ambulanceImg from '../assets/images/real_ambulance_photo_1788963980749.jpg';
import airplaneImg from '../assets/images/airplane_real_photo_1787746802542.jpg';

// Action & Functional Clue Photos
import writeImg from '../assets/images/person_writing_paper_1787733662187.jpg';
import eatImg from '../assets/images/person_eating_food_1787733573122.jpg';
import drinkImg from '../assets/images/person_drinking_water_1787733588109.jpg';
import sleepImg from '../assets/images/person_sleeping_bed_1787733631044.jpg';
import sitImg from '../assets/images/person_sitting_chair_1787733616670.jpg';
import washImg from '../assets/images/person_washing_hands_1787733642564.jpg';
import openDoorImg from '../assets/images/person_opening_door_1787733694820.jpg';
import walkImg from '../assets/images/person_walking_step_1787733603957.jpg';

export interface DefinitionOption {
  id: string;
  nameAr: string;
  dialectNameAr: string;
  nameFr: string;
  image: string;
  phoneticAr: string;
  firstSound: string;
  articulatoryNote: string;
}

export interface DefinitionQuestion {
  id: string;
  categoryNameAr: string;
  categoryIcon: string;
  definitionAr: string;
  definitionDialectAr: string;
  definitionFr: string;
  shortFunctionalHint: string;
  actionClueImage: string;
  actionClueLabel: string;
  correctOptionId: string;
  options: DefinitionOption[];
  explanationAr: string;
  audioUrl?: string; // Optional real human voice audio URL or import
  audioDialectUrl?: string; // Optional real human voice dialect audio URL or import
}

export const DEFINITION_QUESTIONS: DefinitionQuestion[] = [
  // 1. القلم (المثال المذكور من قبل المستخدم)
  {
    id: 'def_pen_write',
    categoryNameAr: 'الأدوات والدراسة',
    categoryIcon: '✏️',
    definitionAr: 'أرني الشيء الذي نكتب به ونرسم به على الورق',
    definitionDialectAr: 'ورّيني الحاجة اللي نكتبو بيها ونرسمو بيها فالورقة',
    definitionFr: 'Montre-moi l\'objet avec lequel on écrit sur le papier',
    shortFunctionalHint: 'أداة كتابة وتدوين بالحبر أو الرصاص',
    actionClueImage: writeImg,
    actionClueLabel: 'كتابة وتدوين على الورق بالقلم',
    correctOptionId: 'pen',
    options: [
      {
        id: 'eraser',
        nameAr: 'ممحاة',
        dialectNameAr: 'ممحاة (غومة)',
        nameFr: 'Gomme',
        image: eraserImg,
        phoneticAr: 'مـِ - مـْ - حـَ - ا - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم شفوية ثم حاء حلقية ومد الألف',
      },
      {
        id: 'pen',
        nameAr: 'قلم',
        dialectNameAr: 'قلم (ستيلو)',
        nameFr: 'Stylo / Crayon',
        image: penImg,
        phoneticAr: 'قـَ - لـَ - م',
        firstSound: 'قـَ...',
        articulatoryNote: 'قاف لهوية انفجارية مع لام لثوية وميم شفوية',
      },
      {
        id: 'ruler',
        nameAr: 'مسطرة',
        dialectNameAr: 'مسطرة (ريڨل)',
        nameFr: 'Règle',
        image: rulerImg,
        phoneticAr: 'مـِ - سـْ - طـَ - رَ - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مكسورة ثم سين ساكنة وطاء مفخمة',
      },
      {
        id: 'sharpener',
        nameAr: 'مبراة',
        dialectNameAr: 'مبراة (طاي كيون)',
        nameFr: 'Taille-crayon',
        image: sharpenerImg,
        phoneticAr: 'مـِ - بـْ - رَ - ا - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم شفوية مع باء مقلقلة وراء مفتوحة',
      },
    ],
    explanationAr: 'القلم (الستيلو) هو الأداة المخصصة للكتابة والتدوين.',
  },

  // 2. الملعقة (الأكل)
  {
    id: 'def_spoon_eat',
    categoryNameAr: 'أدوات المطبخ',
    categoryIcon: '🥄',
    definitionAr: 'أرني الشيء الذي نأكل به الشوربة والحساء',
    definitionDialectAr: 'ورّيني الحاجة اللي ناكلو بيها الشربة والماكلة',
    definitionFr: 'Montre-moi l\'ustensile avec lequel on mange la soupe',
    shortFunctionalHint: 'أداة لتناول الأطعمة السائلة والشوربة',
    actionClueImage: eatImg,
    actionClueLabel: 'تناول الطعام بالملعقة',
    correctOptionId: 'spoon',
    options: [
      {
        id: 'spoon',
        nameAr: 'ملعقة',
        dialectNameAr: 'مغرف (ملعقة)',
        nameFr: 'Cuillère',
        image: spoonImg,
        phoneticAr: 'مـِ - لـْ - عـَ - قـَ - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم شفوية مكسورة مع عين حلقية وقاف',
      },
      {
        id: 'cup',
        nameAr: 'كأس',
        dialectNameAr: 'كاس',
        nameFr: 'Verre / Tasse',
        image: cupImg,
        phoneticAr: 'كـَ - أْ - س',
        firstSound: 'كـَ...',
        articulatoryNote: 'كاف طبقية مهموسة مع سين صفيرية',
      },
      {
        id: 'chair',
        nameAr: 'كرسي',
        dialectNameAr: 'كرسي',
        nameFr: 'Chaise',
        image: chairImg,
        phoneticAr: 'كـُ - رْ - سـِ - ي',
        firstSound: 'كـُ...',
        articulatoryNote: 'كاف مضمومة ثم راء ساكنة وسين',
      },
      {
        id: 'key',
        nameAr: 'مفتاح',
        dialectNameAr: 'مفتاح (ساروت)',
        nameFr: 'Clé',
        image: keyImg,
        phoneticAr: 'مـِ - فـْ - تـَ - ا - ح',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع فاء شفوية أسنانية وتاء مفتوحة',
      },
    ],
    explanationAr: 'الملعقة (المغرف) هي الأداة التي نأكل بها الشوربة والحساء.',
  },

  // 3. الكأس (شرب الماء)
  {
    id: 'def_cup_drink',
    categoryNameAr: 'الأدوات المنزلية',
    categoryIcon: '🥛',
    definitionAr: 'أرني الشيء الذي نملأ فيه الماء أو العصير لنشرب',
    definitionDialectAr: 'ورّيني الحاجة اللي نفرغو فيها الماء والعصير باش نشربو',
    definitionFr: 'Montre-moi l\'objet dans lequel on boit de l\'eau',
    shortFunctionalHint: 'وعاء مخصص لشرب السوائل والماء',
    actionClueImage: drinkImg,
    actionClueLabel: 'شرب الماء من الكأس',
    correctOptionId: 'cup',
    options: [
      {
        id: 'pen',
        nameAr: 'قلم',
        dialectNameAr: 'قلم (ستيلو)',
        nameFr: 'Stylo',
        image: penImg,
        phoneticAr: 'قـَ - لـَ - م',
        firstSound: 'قـَ...',
        articulatoryNote: 'قاف لهوية مع لام وميم',
      },
      {
        id: 'cup',
        nameAr: 'كأس',
        dialectNameAr: 'كاس',
        nameFr: 'Verre / Tasse',
        image: cupImg,
        phoneticAr: 'كـَ - أْ - س',
        firstSound: 'كـَ...',
        articulatoryNote: 'كاف طبقية مهموسة مع سين صفيرية',
      },
      {
        id: 'shoes',
        nameAr: 'حذاء',
        dialectNameAr: 'صباط (حذاء)',
        nameFr: 'Chaussures',
        image: shoesImg,
        phoneticAr: 'حـِ - ذَ - ا - ء',
        firstSound: 'حـِ...',
        articulatoryNote: 'حاء حلقية مع ذال لثوية بين أسنانية',
      },
      {
        id: 'table',
        nameAr: 'طاولة',
        dialectNameAr: 'طابلة (طاولة)',
        nameFr: 'Table',
        image: tableImg,
        phoneticAr: 'طـَ - ا - وِ - لـَ - ة',
        firstSound: 'طـَ...',
        articulatoryNote: 'طاء لثوية مفخمة مع واو ولام',
      },
    ],
    explanationAr: 'الكأس (الكاس) هو الوعاء المخصص لشرب الماء والعصير.',
  },

  // 4. السرير (النوم)
  {
    id: 'def_bed_sleep',
    categoryNameAr: 'الأثاث المنزلي',
    categoryIcon: '🛏️',
    definitionAr: 'أرني الشيء الذي ننام ونرتاح عليه في الليل',
    definitionDialectAr: 'ورّيني الحاجة اللي نرقدو ونريحو عليها فالليل',
    definitionFr: 'Montre-moi le meuble sur lequel on dort la nuit',
    shortFunctionalHint: 'أثاث مخصص للنوم والراحة',
    actionClueImage: sleepImg,
    actionClueLabel: 'النوم والاستلقاء في السرير للراحة',
    correctOptionId: 'bed',
    options: [
      {
        id: 'chair',
        nameAr: 'كرسي',
        dialectNameAr: 'كرسي',
        nameFr: 'Chaise',
        image: chairImg,
        phoneticAr: 'كـُ - رْ - سـِ - ي',
        firstSound: 'كـُ...',
        articulatoryNote: 'كاف مضمومة مع راء وسين',
      },
      {
        id: 'door',
        nameAr: 'باب',
        dialectNameAr: 'باب',
        nameFr: 'Porte',
        image: doorImg,
        phoneticAr: 'بـَ - ا - ب',
        firstSound: 'بـَ...',
        articulatoryNote: 'باء شفوية انفجارية مع مد الألف',
      },
      {
        id: 'bed',
        nameAr: 'سرير',
        dialectNameAr: 'سرير (فراش / مطرح)',
        nameFr: 'Lit',
        image: bedImg,
        phoneticAr: 'سـَ - رِ - ي - ر',
        firstSound: 'سـَ...',
        articulatoryNote: 'سين لثوية صفيرية مع راء وياء',
      },
      {
        id: 'phone',
        nameAr: 'هاتف',
        dialectNameAr: 'تليفون (هاتف)',
        nameFr: 'Téléphone',
        image: phoneImg,
        phoneticAr: 'هـَ - ا - تـِ - ف',
        firstSound: 'هـَ...',
        articulatoryNote: 'هاء حنجرية مع تاء وفاء',
      },
    ],
    explanationAr: 'السرير (الفراش) هو المكان الذي ننام ونرتاح عليه.',
  },

  // 5. المفتاح (فتح الباب)
  {
    id: 'def_key_open',
    categoryNameAr: 'الأدوات والأمان',
    categoryIcon: '🔑',
    definitionAr: 'أرني الشيء الذي نفتح ونغلق به قفل الباب',
    definitionDialectAr: 'ورّيني الحاجة اللي نحلّو ونغلقو بيها الساروت وقفل الباب',
    definitionFr: 'Montre-moi l\'objet avec lequel on ouvre la porte',
    shortFunctionalHint: 'أداة معدنية لفتح وإغلاق الأقفال',
    actionClueImage: openDoorImg,
    actionClueLabel: 'فتح قفل الباب بالمفتاح',
    correctOptionId: 'key',
    options: [
      {
        id: 'key',
        nameAr: 'مفتاح',
        dialectNameAr: 'مفتاح (ساروت)',
        nameFr: 'Clé',
        image: keyImg,
        phoneticAr: 'مـِ - فـْ - تـَ - ا - ح',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مكسورة مع فاء ساكنة وتاء مفتوحة وحاء حلقية',
      },
      {
        id: 'ruler',
        nameAr: 'مسطرة',
        dialectNameAr: 'مسطرة (ريڨل)',
        nameFr: 'Règle',
        image: rulerImg,
        phoneticAr: 'مـِ - سـْ - طـَ - رَ - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مكسورة مع سين وطاء',
      },
      {
        id: 'apple',
        nameAr: 'تفاح',
        dialectNameAr: 'تفاح',
        nameFr: 'Pomme',
        image: appleImg,
        phoneticAr: 'تـُ - فـّ - ا - ح',
        firstSound: 'تـُ...',
        articulatoryNote: 'تاء مضمومة مع فاء مشددة وحاء',
      },
      {
        id: 'scissors',
        nameAr: 'مقص',
        dialectNameAr: 'مقص',
        nameFr: 'Ciseaux',
        image: scissorsImg,
        phoneticAr: 'مـِ - قـَ - صّ',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع قاف وصاد مفخمة مشددة',
      },
    ],
    explanationAr: 'المفتاح (الساروت) هو الأداة المخصصة لفتح وإغلاق الأبواب.',
  },

  // 6. الحذاء (المشي والمحافظة على القدمين)
  {
    id: 'def_shoes_walk',
    categoryNameAr: 'الملابس والمظهر',
    categoryIcon: '👟',
    definitionAr: 'أرني الشيء الذي نلبسه في أرجلنا عند الخروج والمشي',
    definitionDialectAr: 'ورّيني الحاجة اللي نلبسوها فرجلينا باش نخرجو ونمشيو',
    definitionFr: 'Montre-moi ce qu\'on met aux pieds pour marcher',
    shortFunctionalHint: 'لباس للقدمين للمشي والحماية',
    actionClueImage: walkImg,
    actionClueLabel: 'المشي بخطوات واضحة بالقدمين',
    correctOptionId: 'shoes',
    options: [
      {
        id: 'hat',
        nameAr: 'قبعة',
        dialectNameAr: 'شابو (قبعة)',
        nameFr: 'Chapeau',
        image: hatImg,
        phoneticAr: 'قـُ - بـّ - عـَ - ة',
        firstSound: 'قـُ...',
        articulatoryNote: 'قاف مضمومة مع باء مشددة وعين',
      },
      {
        id: 'shirt',
        nameAr: 'قميص',
        dialectNameAr: 'تريكو (قميص)',
        nameFr: 'Chemise / T-shirt',
        image: shirtImg,
        phoneticAr: 'قـَ - مـِ - ي - ص',
        firstSound: 'قـَ...',
        articulatoryNote: 'قاف مفتوحة مع ميم وصاد',
      },
      {
        id: 'shoes',
        nameAr: 'حذاء',
        dialectNameAr: 'صباط (حذاء)',
        nameFr: 'Chaussures',
        image: shoesImg,
        phoneticAr: 'حـِ - ذَ - ا - ء',
        firstSound: 'حـِ...',
        articulatoryNote: 'حاء حلقية مكسورة مع ذال لثوية ومد وهمزة',
      },
      {
        id: 'spoon',
        nameAr: 'ملعقة',
        dialectNameAr: 'مغرف (ملعقة)',
        nameFr: 'Cuillère',
        image: spoonImg,
        phoneticAr: 'مـِ - لـْ - عـَ - قـَ - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع عين وقاف',
      },
    ],
    explanationAr: 'الحذاء (الصباط) هو الذي نلبسه في أرجلنا عند المشي.',
  },

  // 7. فرشاة الأسنان (تنظيف الأسنان)
  {
    id: 'def_toothbrush_clean',
    categoryNameAr: 'النظافة الشخصية',
    categoryIcon: '🪥',
    definitionAr: 'أرني الشيء الذي ننظف ونفرش به أسناننا كل يوم',
    definitionDialectAr: 'ورّيني الحاجة اللي نحكو ونغسلو بيها أسنانا كل يوم',
    definitionFr: 'Montre-moi l\'objet avec lequel on se brosse les dents',
    shortFunctionalHint: 'أداة صحية لنظافة الفم والأسنان',
    actionClueImage: washImg,
    actionClueLabel: 'شخص يعتني بنظافته في المغسلة',
    correctOptionId: 'toothbrush',
    options: [
      {
        id: 'sharpener',
        nameAr: 'مبراة',
        dialectNameAr: 'طاي كيون (مبراة)',
        nameFr: 'Taille-crayon',
        image: sharpenerImg,
        phoneticAr: 'مـِ - بـْ - رَ - ا - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع باء وراء',
      },
      {
        id: 'toothbrush',
        nameAr: 'فرشاة أسنان',
        dialectNameAr: 'فرشاة أسنان (بروس دون)',
        nameFr: 'Brosse à dents',
        image: toothbrushImg,
        phoneticAr: 'فـُ - رْ - شـَ - ا - ة',
        firstSound: 'فـُ...',
        articulatoryNote: 'فاء شفوية أسنانية مع شين شجرية وتفشي',
      },
      {
        id: 'eraser',
        nameAr: 'ممحاة',
        dialectNameAr: 'ممحاة (غومة)',
        nameFr: 'Gomme',
        image: eraserImg,
        phoneticAr: 'مـِ - مـْ - حـَ - ا - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع حاء',
      },
      {
        id: 'cup',
        nameAr: 'كأس',
        dialectNameAr: 'كاس',
        nameFr: 'Verre',
        image: cupImg,
        phoneticAr: 'كـَ - أْ - س',
        firstSound: 'كـَ...',
        articulatoryNote: 'كاف مع سين',
      },
    ],
    explanationAr: 'فرشاة الأسنان هي الأداة المخصصة لتنظيف وحماية الأسنان.',
  },

  // 8. المقص (قص الورق والقماش)
  {
    id: 'def_scissors_cut',
    categoryNameAr: 'الأدوات والأشغال',
    categoryIcon: '✂️',
    definitionAr: 'أرني الشيء الذي نقص ونقطع به الورق أو القماش',
    definitionDialectAr: 'ورّيني الحاجة اللي نقصو ونفصلو بيها الورق والقماش',
    definitionFr: 'Montre-moi l\'outil qui sert à découper le papier ou le tissu',
    shortFunctionalHint: 'أداة حادة ذات حدين للقص والتقطيع',
    actionClueImage: writeImg,
    actionClueLabel: 'أشغال مكتبية وقص وتشكيل الورق',
    correctOptionId: 'scissors',
    options: [
      {
        id: 'scissors',
        nameAr: 'مقص',
        dialectNameAr: 'مقص (سيزو)',
        nameFr: 'Ciseaux',
        image: scissorsImg,
        phoneticAr: 'مـِ - قـَ - صّ',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم شفوية مع قاف لهوية وصاد مفخمة مشددة',
      },
      {
        id: 'ruler',
        nameAr: 'مسطرة',
        dialectNameAr: 'مسطرة (ريڨل)',
        nameFr: 'Règle',
        image: rulerImg,
        phoneticAr: 'مـِ - سـْ - طـَ - رَ - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع سين وطاء',
      },
      {
        id: 'pen',
        nameAr: 'قلم',
        dialectNameAr: 'ستيلو (قلم)',
        nameFr: 'Stylo',
        image: penImg,
        phoneticAr: 'قـَ - لـَ - م',
        firstSound: 'قـَ...',
        articulatoryNote: 'قاف مع لام وميم',
      },
      {
        id: 'chair',
        nameAr: 'كرسي',
        dialectNameAr: 'كرسي',
        nameFr: 'Chaise',
        image: chairImg,
        phoneticAr: 'كـُ - رْ - سـِ - ي',
        firstSound: 'كـُ...',
        articulatoryNote: 'كاف مع راء وسين',
      },
    ],
    explanationAr: 'المقص هو الأداة المخصصة لقص الورق والقماش بدقة.',
  },

  // 9. القبعة (حماية الرأس من الشمس)
  {
    id: 'def_hat_head',
    categoryNameAr: 'الملابس والإكسسوارات',
    categoryIcon: '🧢',
    definitionAr: 'أرني الشيء الذي نضعه فوق الرأس للحماية من حرارة الشمس',
    definitionDialectAr: 'ورّيني الحاجة اللي نديروها فوق راسنا على الشمس والسخانة',
    definitionFr: 'Montre-moi ce qu\'on met sur la tête pour se protéger du soleil',
    shortFunctionalHint: 'غطاء للرأس للوقاية من أشعة الشمس',
    actionClueImage: walkImg,
    actionClueLabel: 'المشي في الخارج تحت أشعة الشمس',
    correctOptionId: 'hat',
    options: [
      {
        id: 'hat',
        nameAr: 'قبعة',
        dialectNameAr: 'شابو / كاسكيطة (قبعة)',
        nameFr: 'Chapeau / Casquette',
        image: hatImg,
        phoneticAr: 'قـُ - بـّ - عـَ - ة',
        firstSound: 'قـُ...',
        articulatoryNote: 'قاف مضمومة مع باء شفوية مشددة وعين حلقية',
      },
      {
        id: 'shoes',
        nameAr: 'حذاء',
        dialectNameAr: 'صباط (حذاء)',
        nameFr: 'Chaussures',
        image: shoesImg,
        phoneticAr: 'حـِ - ذَ - ا - ء',
        firstSound: 'حـِ...',
        articulatoryNote: 'حاء مع ذال وهمزة',
      },
      {
        id: 'pants',
        nameAr: 'سروال',
        dialectNameAr: 'سروال (بنطلون)',
        nameFr: 'Pantalon',
        image: pantsImg,
        phoneticAr: 'سـِ - رْ - و - ا - ل',
        firstSound: 'سـِ...',
        articulatoryNote: 'سين لثوية صفيرية مع راء ساكنة واستدارة واو ممدودة',
      },
      {
        id: 'coat',
        nameAr: 'معطف',
        dialectNameAr: 'فيستة / كابوت (معطف)',
        nameFr: 'Manteau / Veste',
        image: coatImg,
        phoneticAr: 'مـِ - عـْ - طـَ - ف',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع عين وطاء وفاء',
      },
    ],
    explanationAr: 'القبعة (الشابو) هي التي نضعها فوق الرأس للحماية من الشمس.',
  },

  // 10. الكلب (الحيوان الوفي والحراسة)
  {
    id: 'def_dog_bark',
    categoryNameAr: 'عالم الحيوان',
    categoryIcon: '🐕',
    definitionAr: 'أرني الحيوان الأليف الذي ينبح ويحرس البيت وصاحبه',
    definitionDialectAr: 'ورّيني الحيوان اللي ينبح ويعس على الدار وماليه',
    definitionFr: 'Montre-moi l\'animal qui aboie et garde la maison',
    shortFunctionalHint: 'حيوان وفي معروف بالحراسة والنباح',
    actionClueImage: dogImg,
    actionClueLabel: 'حيوان أليف حارس',
    correctOptionId: 'dog',
    options: [
      {
        id: 'cat',
        nameAr: 'قطة',
        dialectNameAr: 'قطوس (قطة)',
        nameFr: 'Chat',
        image: catImg,
        phoneticAr: 'قـِ - طـّ - ة',
        firstSound: 'قـِ...',
        articulatoryNote: 'قاف مكسورة مع طاء مفخمة مشددة',
      },
      {
        id: 'dog',
        nameAr: 'كلب',
        dialectNameAr: 'كلب',
        nameFr: 'Chien',
        image: dogImg,
        phoneticAr: 'كـَ - لـْ - ب',
        firstSound: 'كـَ...',
        articulatoryNote: 'كاف طبقية مع لام لثوية وباء شفوية',
      },
      {
        id: 'sheep',
        nameAr: 'خروف',
        dialectNameAr: 'كبش (خروف)',
        nameFr: 'Mouton',
        image: sheepImg,
        phoneticAr: 'خـَ - رُ - و - ف',
        firstSound: 'خـَ...',
        articulatoryNote: 'خاء لهاوية مع راء وفاء',
      },
      {
        id: 'cow',
        nameAr: 'بقرة',
        dialectNameAr: 'بقرة',
        nameFr: 'Vache',
        image: cowImg,
        phoneticAr: 'بـَ - قـَ - رَ - ة',
        firstSound: 'بـَ...',
        articulatoryNote: 'باء مع قاف وراء',
      },
    ],
    explanationAr: 'الكلب هو الحيوان الوفي الذي ينبح ويحرس المنزل.',
  },

  // 11. الليمون (الفاكهة الحامضة)
  {
    id: 'def_lemon_sour',
    categoryNameAr: 'الفواكه والأطعمة',
    categoryIcon: '🍋',
    definitionAr: 'أرني الفاكهة الصفراء الحامضة التي نعصرها مع السلطة أو الشاي',
    definitionDialectAr: 'ورّيني الحبة الصفرة القارصة اللي نعصروها فالشلاطة والتاي',
    definitionFr: 'Montre-moi le fruit jaune et acide qu\'on presse sur la salade',
    shortFunctionalHint: 'فاكهة حمضية صفراء اللون وقارصة المذاق',
    actionClueImage: eatImg,
    actionClueLabel: 'تحضير الطعام والعصائر الطبيعية',
    correctOptionId: 'lemon',
    options: [
      {
        id: 'banana',
        nameAr: 'موز',
        dialectNameAr: 'بنان (موز)',
        nameFr: 'Banane',
        image: bananaImg,
        phoneticAr: 'مـَ - وْ - ز',
        firstSound: 'مـَ...',
        articulatoryNote: 'ميم مع واو وزاي صفيرية',
      },
      {
        id: 'apple',
        nameAr: 'تفاح',
        dialectNameAr: 'تفاح',
        nameFr: 'Pomme',
        image: appleImg,
        phoneticAr: 'تـُ - فـّ - ا - ح',
        firstSound: 'تـُ...',
        articulatoryNote: 'تاء مع فاء وحاء',
      },
      {
        id: 'lemon',
        nameAr: 'ليمون',
        dialectNameAr: 'قارص (ليمون)',
        nameFr: 'Citron',
        image: lemonImg,
        phoneticAr: 'لـَ - يـْ - مـُ - و - ن',
        firstSound: 'لـَ...',
        articulatoryNote: 'لام لثوية مع ياء وميم مضمومة ونون',
      },
      {
        id: 'strawberry',
        nameAr: 'فراولة',
        dialectNameAr: 'فريز (فراولة)',
        nameFr: 'Fraise',
        image: strawberryImg,
        phoneticAr: 'فـَ - رَ - ا - وْ - لـَ - ة',
        firstSound: 'فـَ...',
        articulatoryNote: 'فاء مع راء وواو ولام',
      },
    ],
    explanationAr: 'الليمون (القارص) هو الفاكهة الصفراء الحامضة المخصصة للعصير والسلطات.',
  },

  // 12. الهاتف (الاتصال والمحادثة)
  {
    id: 'def_phone_call',
    categoryNameAr: 'الأجهزة والتواصل',
    categoryIcon: '📱',
    definitionAr: 'أرني الجهاز الذي نتصل به ونتكلم مع أحبابنا عن بعد',
    definitionDialectAr: 'ورّيني الجهاز اللي نعيطو ونهدرو بيه فالتليفون مع الناس',
    definitionFr: 'Montre-moi l\'appareil avec lequel on appelle et communique',
    shortFunctionalHint: 'جهاز إلكتروني للاتصال والمكالمات الصوتية',
    actionClueImage: phoneImg,
    actionClueLabel: 'جهاز اتصال هاتفي ذكي',
    correctOptionId: 'phone',
    options: [
      {
        id: 'phone',
        nameAr: 'هاتف',
        dialectNameAr: 'تليفون / بورطابل (هاتف)',
        nameFr: 'Téléphone',
        image: phoneImg,
        phoneticAr: 'هـَ - ا - تـِ - ف',
        firstSound: 'هـَ...',
        articulatoryNote: 'هاء حنجرية مع مد وتلفظ تاء وفاء',
      },
      {
        id: 'cup',
        nameAr: 'كأس',
        dialectNameAr: 'كاس',
        nameFr: 'Verre',
        image: cupImg,
        phoneticAr: 'كـَ - أْ - س',
        firstSound: 'كـَ...',
        articulatoryNote: 'كاف مع سين',
      },
      {
        id: 'key',
        nameAr: 'مفتاح',
        dialectNameAr: 'ساروت (مفتاح)',
        nameFr: 'Clé',
        image: keyImg,
        phoneticAr: 'مـِ - فـْ - تـَ - ا - ح',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع تاء وحاء',
      },
      {
        id: 'door',
        nameAr: 'باب',
        dialectNameAr: 'باب',
        nameFr: 'Porte',
        image: doorImg,
        phoneticAr: 'بـَ - ا - ب',
        firstSound: 'بـَ...',
        articulatoryNote: 'باء مع ألف وباء',
      },
    ],
    explanationAr: 'الهاتف (التليفون) هو الجهاز المخصص للتواصل والمكالمات.',
  },

  // 13. الممحاة (مسح وتصحيح الخطأ)
  {
    id: 'def_eraser_erase',
    categoryNameAr: 'الأدوات والدراسة',
    categoryIcon: '🧼',
    definitionAr: 'أرني الشيء الذي نمسح به خطأ الكتابة بالرصاص على الورقة',
    definitionDialectAr: 'ورّيني الحاجة اللي نمحيو ونمسحو بيها الكتيبه يلا غلطنا',
    definitionFr: 'Montre-moi l\'objet qui sert à effacer les erreurs de crayon',
    shortFunctionalHint: 'أداة مطاطية لمسح وتصحيح الكتابة بالقلم الرصاص',
    actionClueImage: writeImg,
    actionClueLabel: 'تصحيح ومسح ما تم كتابته بالرصاص',
    correctOptionId: 'eraser',
    options: [
      {
        id: 'pen',
        nameAr: 'قلم',
        dialectNameAr: 'ستيلو (قلم)',
        nameFr: 'Stylo',
        image: penImg,
        phoneticAr: 'قـَ - لـَ - م',
        firstSound: 'قـَ...',
        articulatoryNote: 'قاف مع لام وميم',
      },
      {
        id: 'eraser',
        nameAr: 'ممحاة',
        dialectNameAr: 'ممحاة (غومة)',
        nameFr: 'Gomme',
        image: eraserImg,
        phoneticAr: 'مـِ - مـْ - حـَ - ا - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مكسورة مع ميم ساكنة وحاء حلقية',
      },
      {
        id: 'ruler',
        nameAr: 'مسطرة',
        dialectNameAr: 'مسطرة (ريڨل)',
        nameFr: 'Règle',
        image: rulerImg,
        phoneticAr: 'مـِ - سـْ - طـَ - رَ - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع سين وطاء',
      },
      {
        id: 'sharpener',
        nameAr: 'مبراة',
        dialectNameAr: 'طاي كيون (مبراة)',
        nameFr: 'Taille-crayon',
        image: sharpenerImg,
        phoneticAr: 'مـِ - بـْ - رَ - ا - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع باء وراء',
      },
    ],
    explanationAr: 'الممحاة (الغومة) هي الأداة المخصصة لمسح وتصحيح الكتابة.',
  },

  // 14. المسطرة (تسطير الخط المستقيم)
  {
    id: 'def_ruler_straight',
    categoryNameAr: 'الأدوات والدراسة',
    categoryIcon: '📏',
    definitionAr: 'أرني الشيء المستقيم الذي نرسم به خطوطاً مستقيمة ونقيس به الأطوال',
    definitionDialectAr: 'ورّيني المسطرة المستقيمة اللي نسطرو بيها الخط ونديرو القياس',
    definitionFr: 'Montre-moi l\'instrument qui sert à tracer des lignes droites et mesurer',
    shortFunctionalHint: 'أداة قياس وتسطير الخطوط المستقيمة',
    actionClueImage: writeImg,
    actionClueLabel: 'رسم وتسطير خط مستقيم على الورق',
    correctOptionId: 'ruler',
    options: [
      {
        id: 'ruler',
        nameAr: 'مسطرة',
        dialectNameAr: 'مسطرة (ريڨل)',
        nameFr: 'Règle',
        image: rulerImg,
        phoneticAr: 'مـِ - سـْ - طـَ - رَ - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مكسورة مع سين صفيرية وطاء مفخمة وراء مفتوحة',
      },
      {
        id: 'eraser',
        nameAr: 'ممحاة',
        dialectNameAr: 'ممحاة (غومة)',
        nameFr: 'Gomme',
        image: eraserImg,
        phoneticAr: 'مـِ - مـْ - حـَ - ا - ة',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع حاء',
      },
      {
        id: 'scissors',
        nameAr: 'مقص',
        dialectNameAr: 'مقص (سيزو)',
        nameFr: 'Ciseaux',
        image: scissorsImg,
        phoneticAr: 'مـِ - قـَ - صّ',
        firstSound: 'مـِ...',
        articulatoryNote: 'ميم مع قاف وصاد',
      },
      {
        id: 'pen',
        nameAr: 'قلم',
        dialectNameAr: 'ستيلو (قلم)',
        nameFr: 'Stylo',
        image: penImg,
        phoneticAr: 'قـَ - لـَ - م',
        firstSound: 'قـَ...',
        articulatoryNote: 'قاف مع لام وميم',
      },
    ],
    explanationAr: 'المسطرة هي الأداة المخصصة لتسطير الخطوط المستقيمة وقياس الأطوال.',
  },

  // 17. سيارة (Car)
  {
    id: 'def-car',
    categoryNameAr: 'وسائل النقل',
    categoryIcon: '🚗',
    definitionAr: 'وسيلة نقل نركبها مع العائلة للتنقل على الطريق، لها أربعة عجلات ومقود ومحرك.',
    definitionDialectAr: 'طوموبيل نركبو فيها باه نتنقلو في الطريق، عندها ربعة روايد وفولون.',
    definitionFr: 'Véhicule à quatre roues qui permet de se déplacer sur la route en famille.',
    shortFunctionalHint: 'مركبة على الطريق للتنقل (طوموبيل)',
    actionClueImage: carImg,
    actionClueLabel: 'سيارة عائلية للتنقل على الطريق',
    correctOptionId: 'car',
    options: [
      {
        id: 'car',
        nameAr: 'سيارة',
        dialectNameAr: 'طوموبيل / سيارة',
        nameFr: 'Voiture',
        image: carImg,
        phoneticAr: 'سـَ - يـَّ - ا - رَ - ة',
        firstSound: 'سـَ...',
        articulatoryNote: 'سين لثوية صفيرية مهموسة /سـَ/ ثم ياء مشددة مفتوحة /يَّا/ وراء مرققة',
      },
      {
        id: 'bus',
        nameAr: 'حافلة',
        dialectNameAr: 'كار / حافلة',
        nameFr: 'Bus',
        image: busImg,
        phoneticAr: 'حـَ - ا - فـِ - لـَ - ة',
        firstSound: 'حـَ...',
        articulatoryNote: 'حاء حلقية مهموسة ثم فاء ولام',
      },
      {
        id: 'bicycle',
        nameAr: 'دراجة',
        dialectNameAr: 'فيلو / بيسكليت',
        nameFr: 'Vélo',
        image: bicycleImg,
        phoneticAr: 'دَ - رّ - ا - جـَ - ة',
        firstSound: 'دَ...',
        articulatoryNote: 'دال لثوية مع راء وجيم',
      },
      {
        id: 'airplane',
        nameAr: 'طائرة',
        dialectNameAr: 'طيارة',
        nameFr: 'Avion',
        image: airplaneImg,
        phoneticAr: 'طـَ - يـَّ - ا - رَ - ة',
        firstSound: 'طـَ...',
        articulatoryNote: 'طاء لثوية مفخمة مع ياء وراء',
      },
    ],
    explanationAr: 'السيارة (الطوموبيل) هي وسيلة النقل البرية التي تسير على أربع عجلات للتنقل الشخصي والعائلي.',
  },

  // 18. سيارة إسعاف (Ambulance)
  {
    id: 'def-ambulance',
    categoryNameAr: 'وسائل النقل',
    categoryIcon: '🚑',
    definitionAr: 'سيارة طبية مجهزة تنقل المريض أو المصاب بسرعة إلى المستشفى ولها صفارة إنذار.',
    definitionDialectAr: 'سيارة طبية تدي المريض للسبيطار وتطلق الصفارة (سيران).',
    definitionFr: 'Véhicule médicalisé d’urgence pour transporter les malades à l’hôpital.',
    shortFunctionalHint: 'تنقل المرضى للمستشفى (إسعاف)',
    actionClueImage: ambulanceImg,
    actionClueLabel: 'سيارة إسعاف مجهزة للمستشفى للطوارئ',
    correctOptionId: 'ambulance',
    options: [
      {
        id: 'ambulance',
        nameAr: 'سيارة إسعاف',
        dialectNameAr: 'لومبيلونس / إسعاف',
        nameFr: 'Ambulance',
        image: ambulanceImg,
        phoneticAr: 'إِ - سـْ - عـَ - ا - ف',
        firstSound: 'إِ...',
        articulatoryNote: 'همزة مكسورة مع سين وعين ممدودة وفاء',
      },
      {
        id: 'car',
        nameAr: 'سيارة',
        dialectNameAr: 'طوموبيل',
        nameFr: 'Voiture',
        image: carImg,
        phoneticAr: 'سـَ - يـَّ - ا - رَ - ة',
        firstSound: 'سـَ...',
        articulatoryNote: 'سين مع ياء مشددة وراء',
      },
      {
        id: 'bus',
        nameAr: 'حافلة',
        dialectNameAr: 'كار / حافلة',
        nameFr: 'Bus',
        image: busImg,
        phoneticAr: 'حـَ - ا - فـِ - لـَ - ة',
        firstSound: 'حـَ...',
        articulatoryNote: 'حاء مع فاء ولام',
      },
      {
        id: 'bicycle',
        nameAr: 'دراجة',
        dialectNameAr: 'فيلو',
        nameFr: 'Vélo',
        image: bicycleImg,
        phoneticAr: 'دَ - رّ - ا - جـَ - ة',
        firstSound: 'دَ...',
        articulatoryNote: 'دال مع راء وجيم',
      },
    ],
    explanationAr: 'سيارة الإسعاف (لومبيلونس) مخصصة لحالات الطوارئ لنقل المرضى بسرعة إلى المستشفى.',
  },
];
