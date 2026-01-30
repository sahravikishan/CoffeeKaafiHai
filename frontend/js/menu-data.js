// ==========================================
// COFFEE MENU DATA STRUCTURE
// Enhanced with all Espresso items, stories, and comprehensive menu
// ==========================================

const coffeeMenu = {
    // ==========================================
    // ESPRESSO-BASED DRINKS
    // ==========================================
    "espresso-bliss": {
        category: "Espresso Bliss",
        description: "Rich and bold espresso from premium Arabica beans with notes of dark chocolate and caramel",
        items: [
            {
                id: "esp001",
                name: "Espresso",
                description: "A concentrated shot of pure coffee perfection",
                basePrice: 90,
                sizes: {
                    small: { price: 90, ml: 30 },
                    medium: { price: 120, ml: 60 },
                    large: { price: 150, ml: 90 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875201/2025-12-31/f7057220-87d0-454b-9deb-8838ffe27c83.png",
                popular: true,
                story: "Originating in Italy in the early 20th century, espresso revolutionized coffee culture worldwide. Our espresso is crafted from single-origin Ethiopian Arabica beans, carefully roasted to perfection to bring out intricate notes of dark chocolate and caramel. Each shot is meticulously pulled at precisely 9 bars of pressure for 25-30 seconds, creating that signature golden crema on top that coffee enthusiasts adore. The result is a concentrated burst of flavor that captures the very essence of premium coffee."
            },
            {
                id: "esp002",
                name: "Double Espresso",
                description: "Extra bold double shot for true coffee lovers",
                basePrice: 130,
                sizes: {
                    small: { price: 130, ml: 60 },
                    medium: { price: 160, ml: 120 },
                    large: { price: 190, ml: 180 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875201/2025-12-31/ee61bd89-50d1-4946-ae8d-a9dff37bc43c.png",
                popular: false,
                story: "For those who crave more intensity and depth, our double espresso uses 18 grams of finely ground coffee beans instead of the standard 9 grams. This preparation method is especially popular in traditional Italian cafes where locals prefer a stronger kick to start their day. The double shot delivers bold, robust flavors with a luxuriously velvety texture that lingers on the palate. Perfect for true coffee enthusiasts who appreciate the pure, unadulterated essence of premium coffee beans."
            },
            {
                id: "esp003",
                name: "Americano",
                description: "Espresso diluted with hot water for a smooth, balanced taste",
                basePrice: 120,
                sizes: {
                    small: { price: 120, ml: 180 },
                    medium: { price: 150, ml: 240 },
                    large: { price: 180, ml: 350 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875201/2025-12-31/58133986-e4bb-45f9-8bf3-5cf3766760b5.png",
                popular: true,
                story: "The Americano was born during World War II when American soldiers stationed in Italy found traditional espresso too strong for their taste. They began diluting it with hot water to approximate the coffee they were accustomed to back home. Our Americano maintains the rich, complex espresso flavor while offering a lighter, more approachable body. We use a carefully calibrated 1:2 ratio of espresso to hot water, preserving the intricate flavor notes while creating a smooth, satisfying cup that bridges European and American coffee traditions."
            },
            {
                id: "esp004",
                name: "Long Black",
                description: "Hot water topped with espresso, preserving the rich crema",
                basePrice: 120,
                sizes: {
                    small: { price: 120, ml: 180 },
                    medium: { price: 150, ml: 240 },
                    large: { price: 180, ml: 350 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875201/2025-12-31/7501db17-6b5d-415d-bb00-43811b7aa22e.png",
                popular: false,
                story: "The Long Black is a beloved coffee preparation that originated in Australia and New Zealand, offering a unique twist on the Americano. The key difference lies in the preparation method: hot water is poured first into the cup, then the espresso is gently extracted directly over it. This reverse order preserves the precious crema layer and creates a stronger, more pronounced coffee flavor. Our skilled baristas have perfected this delicate technique to ensure every cup features that beautiful golden crema floating majestically on top, delivering a visual and sensory experience that sets it apart."
            },
            {
                id: "esp005",
                name: "Filter Coffee",
                description: "Classic drip coffee, smooth and aromatic with bright notes",
                basePrice: 100,
                sizes: {
                    small: { price: 100, ml: 200 },
                    medium: { price: 130, ml: 300 },
                    large: { price: 160, ml: 400 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875201/2025-12-31/9e2a760f-19dd-4e19-8a8a-274ed4cfca88.png",
                popular: true,
                story: "Filter coffee has been a cherished staple in households worldwide for generations, representing the art of slow coffee brewing. We employ the traditional pour-over method using premium medium-roast Colombian beans, allowing hot water to extract flavors gradually and evenly. This patient brewing process results in a remarkably clean, bright cup with subtle fruity notes and a smooth, satisfying finish. It's a method that coffee purists love because it allows the true character of the beans to shine through without any interference, creating a pure coffee experience."
            },
            {
                id: "esp006",
                name: "South Indian Filter Coffee",
                description: "Traditional decoction coffee with milk and aromatic spices",
                basePrice: 100,
                sizes: {
                    small: { price: 100, ml: 150 },
                    medium: { price: 130, ml: 200 },
                    large: { price: 160, ml: 250 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875201/2025-12-31/16f70ac6-a1b1-480e-9ddb-a26481769fee.png",
                popular: true,
                story: "South Indian Filter Coffee is a cherished tradition that has been passed down through generations in Tamil Nadu, Karnataka, and Kerala. Our preparation uses dark roasted coffee beans expertly blended with chicory, brewed slowly in a traditional two-chamber metal filter that allows the decoction to drip gradually. The concentrated brew is then mixed with frothy, hot milk and sugar, creating a harmonious balance. The coffee is then poured back and forth between two vessels - a technique called 'meter coffee' - to create that signature froth and cool it to the perfect drinking temperature. Each cup is a tribute to the rich coffee culture of South India."
            },
            {
                id: "esp007",
                name: "Turkish Coffee",
                description: "Unfiltered coffee with rich, bold flavor and ancient tradition",
                basePrice: 180,
                sizes: {
                    small: { price: 180, ml: 90 },
                    medium: { price: 210, ml: 120 },
                    large: { price: 240, ml: 150 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875201/2025-12-31/1edabe5c-cb1c-49bb-a666-3f041c9c3b3a.png",
                popular: false,
                story: "Turkish Coffee traces its illustrious history back to the Ottoman Empire of the 15th century, where it became an integral part of social and cultural life. Our preparation follows the authentic method: coffee beans are ground to an ultra-fine powder - finer than even espresso - and brewed in a traditional copper pot called a 'cezve' or 'ibrik'. The coffee is slowly simmered with water and sugar until it creates a thick foam on top. The result is an intensely strong, thick coffee served in small cups with the grounds naturally settling at the bottom. In 2013, UNESCO recognized Turkish coffee culture and tradition as an Intangible Cultural Heritage of Humanity, cementing its place in world history."
            },
            {
                id: "esp008",
                name: "Macchiato",
                description: "Espresso 'marked' with a dollop of foamed milk for perfect balance",
                basePrice: 110,
                sizes: {
                    small: { price: 110, ml: 60 },
                    medium: { price: 140, ml: 90 },
                    large: { price: 170, ml: 120 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875201/2025-12-31/f7057220-87d0-454b-9deb-8838ffe27c83.png",
                popular: true,
                story: "The Macchiato, meaning 'marked' or 'stained' in Italian, is a sophisticated espresso-based drink that perfectly balances the intensity of espresso with a touch of creamy sweetness. Born in Italy, this drink was created for those who found straight espresso too strong but didn't want a full cappuccino. Our baristas carefully prepare each Macchiato by pulling a perfect espresso shot and then 'marking' it with just a spoonful of velvety steamed milk foam. This small addition softens the espresso's bite while preserving its bold character, creating a harmonious dance of flavors that showcases both the coffee's complexity and the milk's subtle sweetness."
            }
        ]
    },

    // ==========================================
    // MILK-BASED CLASSICS
    // ==========================================
    "milk-brew-classics": {
        category: "Milk Brew Classics",
        description: "Creamy lattes and cappuccinos with perfectly steamed milk and beautiful latte art designs",
        items: [
            {
                id: "milk001",
                name: "Cappuccino",
                description: "Classic Italian coffee with equal parts espresso, steamed milk, and milk foam",
                basePrice: 150,
                sizes: {
                    small: { price: 150, ml: 180 },
                    medium: { price: 180, ml: 240 },
                    large: { price: 210, ml: 300 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/878333/2026-01-02/44002846-9978-47f4-85bd-359749cc0af3.png",
                popular: true,
                story: "The Cappuccino takes its name from the Capuchin friars, whose brown robes resembled the drink's color. This Italian classic is a perfect harmony of three equal layers: rich espresso at the bottom, velvety steamed milk in the middle, and a thick layer of microfoam on top. Our baristas have mastered the art of creating that perfect foam consistency that holds intricate latte art designs. Traditionally enjoyed in the morning in Italy, our cappuccino offers a balanced flavor profile where the espresso's boldness is softened by the creamy milk, creating a comforting and satisfying experience that has made it a worldwide favorite."
            },
            {
                id: "milk002",
                name: "Caffè Latte",
                description: "Smooth espresso with generous steamed milk and a light foam topping",
                basePrice: 160,
                sizes: {
                    small: { price: 160, ml: 240 },
                    medium: { price: 190, ml: 300 },
                    large: { price: 220, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/878333/2026-01-02/27d21082-3b81-428a-a600-95daa10a8239.png",
                popular: true,
                story: "Caffè Latte, meaning 'milk coffee' in Italian, is the perfect introduction to espresso-based drinks for those who prefer a milder coffee experience. Unlike the cappuccino's equal parts, the latte features a higher ratio of steamed milk to espresso, creating a creamier, smoother texture. Our latte begins with a double shot of espresso, followed by carefully steamed milk that's heated to the ideal temperature of 65°C to preserve its natural sweetness. The drink is finished with just a thin layer of foam, making it the perfect canvas for our baristas' artistic latte art creations. It's a comforting, approachable coffee that warms both hands and hearts."
            },
            {
                id: "milk003",
                name: "Flat White",
                description: "Australian favorite with rich espresso and velvety microfoam",
                basePrice: 170,
                sizes: {
                    small: { price: 170, ml: 180 },
                    medium: { price: 200, ml: 240 },
                    large: { price: 230, ml: 300 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/878333/2026-01-02/347553d8-2b70-4636-9015-97f1a79e4846.png",
                popular: true,
                story: "The Flat White originated in Australia and New Zealand in the 1980s as a response to what Antipodean coffee lovers felt was overly frothy cappuccinos. This sophisticated drink features a double shot of espresso combined with steamed milk that has been stretched to create a velvety microfoam - tiny, silky bubbles that integrate seamlessly with the coffee. The result is a stronger coffee flavor than a latte, with a smoother, creamier texture than a cappuccino. Our baristas pour the milk from a precise height to create that signature 'flat' white surface, making it a favorite among coffee connoisseurs who appreciate both flavor and technique."
            },
            {
                id: "milk004",
                name: "Macchiato",
                description: "Espresso 'stained' with a small amount of foamed milk",
                basePrice: 140,
                sizes: {
                    small: { price: 140, ml: 60 },
                    medium: { price: 170, ml: 90 },
                    large: { price: 200, ml: 120 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/878333/2026-01-02/b020b510-e83e-4da8-8ca7-4e15c1444e90.png",
                popular: false,
                story: "The Macchiato, which means 'stained' or 'marked' in Italian, is the perfect bridge between a straight espresso and milkier coffee drinks. In its traditional form, it's simply an espresso 'marked' with just a dollop of foamed milk - enough to soften the espresso's intensity without overwhelming its character. This minimalist approach allows the coffee's complex flavors to shine through while adding a touch of creamy sweetness. Unlike the larger milk-based drinks, the macchiato maintains the espresso's bold personality while offering a gentle introduction to milk-coffee combinations. It's the choice of purists who want just a hint of milk's smoothing effect."
            },
            {
                id: "milk005",
                name: "Mocha",
                description: "Rich blend of espresso, chocolate, and steamed milk",
                basePrice: 180,
                sizes: {
                    small: { price: 180, ml: 240 },
                    medium: { price: 210, ml: 300 },
                    large: { price: 240, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/878333/2026-01-02/edd8df71-7dd2-4fff-96f8-7416e1eb25f1.png",
                popular: true,
                story: "The Mocha is named after the port city of Mocha in Yemen, which was historically famous for its coffee exports. This indulgent drink combines the best of both worlds: rich, aromatic espresso and luxurious chocolate. We use premium Belgian chocolate syrup that's carefully blended with our signature espresso, then topped with steamed milk and a light foam layer. The result is a harmonious balance where neither the coffee nor chocolate dominates, but rather complement each other perfectly. Finished with a dusting of cocoa powder or chocolate shavings, our mocha is a decadent treat that satisfies both coffee and chocolate cravings in one delightful cup."
            },
            {
                id: "milk006",
                name: "Breve",
                description: "Espresso with steamed half-and-half cream for extra richness",
                basePrice: 190,
                sizes: {
                    small: { price: 190, ml: 180 },
                    medium: { price: 220, ml: 240 },
                    large: { price: 250, ml: 300 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/878333/2026-01-02/e7bc4314-e9b0-4e0c-8b08-516e10ac2e77.png",
                popular: false,
                story: "The Breve, Italian for 'short', is an American invention that takes the latte concept to new levels of indulgence. Instead of regular milk, we use half-and-half cream (a blend of milk and cream) that's steamed to create an incredibly rich, velvety texture. The higher fat content in the cream creates a luxurious mouthfeel and enhances the espresso's natural flavors without overpowering them. This drink is particularly popular among those who appreciate a creamier, more decadent coffee experience. The breve's luxurious texture and rich flavor profile make it a special treat, perfect for when you want to indulge in something truly extraordinary."
            },
            {
                id: "milk007",
                name: "Cortado",
                description: "Spanish-style espresso cut with a small amount of warm milk",
                basePrice: 130,
                sizes: {
                    small: { price: 130, ml: 120 },
                    medium: { price: 160, ml: 180 },
                    large: { price: 190, ml: 240 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/878333/2026-01-02/34be5fa1-311a-447e-aa88-8ea4c0fb8111.png",
                popular: false,
                story: "The Cortado, from the Spanish verb 'cortar' meaning 'to cut', is a traditional Spanish coffee that perfectly balances espresso with just enough warm milk to 'cut' through its intensity. Unlike Italian milk drinks, the cortado uses equal parts espresso and steamed milk, resulting in a stronger coffee flavor than a latte but creamier than a macchiato. The milk is steamed to a lower temperature than typical, preserving its natural sweetness without creating much foam. This creates a smooth, velvety texture that allows the espresso's complex flavors to shine through while softening its sharp edges. It's the preferred afternoon coffee in Spain, offering just the right amount of caffeine and creaminess."
            },
            {
                id: "milk008",
                name: "Vienna Coffee",
                description: "Espresso topped with whipped cream and chocolate sprinkles",
                basePrice: 200,
                sizes: {
                    small: { price: 200, ml: 180 },
                    medium: { price: 230, ml: 240 },
                    large: { price: 260, ml: 300 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/878333/2026-01-02/823d69a4-fb76-46c8-a73a-641c8f241a5e.png",
                popular: true,
                story: "Vienna Coffee is a luxurious Austrian creation that transforms espresso into a decadent dessert-like experience. This elegant drink begins with a double shot of our finest espresso, which is then crowned with a generous dollop of freshly whipped cream. The cream is lightly sweetened and carefully piped to create a beautiful, cloud-like topping. Finally, we finish it with a delicate dusting of chocolate sprinkles or cocoa powder. The result is a delightful contrast between the bold, rich espresso below and the light, sweet cream above. As you sip, the cream gradually melts into the coffee, creating a smooth, velvety texture that evolves with each sip. It's the perfect after-dinner coffee or a special treat for any occasion."
            }
        ]
    },

    // ==========================================
    // MOCHA SPECIALTIES
    // ==========================================
    "mocha-magic": {
        category: "Mocha Magic",
        description: "Perfect blend of rich Belgian chocolate and premium espresso, finished with chocolate shavings",
        items: [
            {
                id: "mocha001",
                name: "Classic Mocha",
                description: "Traditional mocha with rich Belgian chocolate and premium espresso",
                basePrice: 180,
                sizes: {
                    small: { price: 180, ml: 240 },
                    medium: { price: 210, ml: 300 },
                    large: { price: 240, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875116/2026-01-02/b2f50f3f-d3b9-4853-8230-72e8373e1da5.png",
                popular: true,
                story: "The Classic Mocha is the foundation of our Mocha Magic collection, combining the rich heritage of Yemeni coffee with Belgian chocolate excellence. This timeless creation dates back to the 16th century when coffee from the port city of Mocha in Yemen was first blended with chocolate. Our version uses premium Belgian chocolate that's carefully melted and blended with our signature espresso, creating a harmonious balance where neither flavor dominates. The drink is finished with a light layer of steamed milk and a dusting of chocolate shavings, offering a perfect introduction to the world of chocolate-infused coffee."
            },
            {
                id: "mocha002",
                name: "Dark Chocolate Mocha",
                description: "Extra dark chocolate with intense espresso for a bold flavor",
                basePrice: 190,
                sizes: {
                    small: { price: 190, ml: 240 },
                    medium: { price: 220, ml: 300 },
                    large: { price: 250, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875116/2026-01-02/c6a281b2-9bc9-4ddd-b192-af4c8aa1b72a.png",
                popular: true,
                story: "For true chocolate connoisseurs, our Dark Chocolate Mocha uses 70% cocoa dark chocolate that provides a sophisticated bitterness that complements the espresso's natural intensity. This combination creates a rich, complex flavor profile with notes of dark berries, roasted nuts, and subtle bitterness. The higher cocoa content means less sugar, allowing the true flavors of both the chocolate and coffee to shine through. It's a favorite among those who appreciate the more sophisticated side of chocolate, offering a grown-up take on the classic mocha that's both indulgent and refined."
            },
            {
                id: "mocha003",
                name: "White Chocolate Mocha",
                description: "Creamy white chocolate delight with smooth espresso",
                basePrice: 190,
                sizes: {
                    small: { price: 190, ml: 240 },
                    medium: { price: 220, ml: 300 },
                    large: { price: 250, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875116/2026-01-02/3b9abaad-8de6-4658-b969-f65e44966056.png",
                popular: false,
                story: "Our White Chocolate Mocha offers a luxurious twist on the traditional mocha, using premium white chocolate made from cocoa butter, milk solids, and sugar. Unlike dark chocolate, white chocolate contains no cocoa solids, resulting in a creamier, sweeter flavor that beautifully complements the espresso's bitterness. This drink creates a delightful contrast of flavors and colors, with the ivory-white chocolate blending into the rich brown coffee. The result is a smooth, velvety texture with vanilla and caramel notes that make it particularly popular among those who prefer sweeter coffee drinks. It's like dessert in a cup!"
            },
            {
                id: "mocha004",
                name: "Mint Chocolate Mocha",
                description: "Refreshing mint chocolate with espresso for a cool twist",
                basePrice: 195,
                sizes: {
                    small: { price: 195, ml: 240 },
                    medium: { price: 225, ml: 300 },
                    large: { price: 255, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875116/2026-01-02/74ff221e-24ad-4340-a6ce-77737a57dfe0.png",
                popular: false,
                story: "The Mint Chocolate Mocha combines two beloved flavors in perfect harmony. Inspired by the classic after-dinner combination of chocolate mints and coffee, this drink features premium chocolate infused with natural peppermint oil. The cooling sensation of mint provides a refreshing contrast to the warm coffee, creating a unique sensory experience. The mint also helps cleanse the palate between sips, allowing you to fully appreciate the chocolate and coffee flavors anew each time. It's particularly popular during the holiday season but makes for a refreshing treat any time of year."
            },
            {
                id: "mocha005",
                name: "Salted Caramel Mocha",
                description: "Sweet and salty caramel twist with chocolate and espresso",
                basePrice: 200,
                sizes: {
                    small: { price: 200, ml: 240 },
                    medium: { price: 230, ml: 300 },
                    large: { price: 260, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875116/2026-01-02/f6cc0285-1736-4fd7-b437-45feebd760c1.png",
                popular: true,
                story: "Our Salted Caramel Mocha represents the perfect marriage of sweet, salty, and bitter flavors. This modern classic combines rich chocolate and espresso with homemade salted caramel sauce that's cooked to perfection. The sea salt crystals in the caramel enhance the chocolate's richness while cutting through the sweetness, creating a complex flavor profile that keeps you coming back for more. The salt also heightens the coffee's natural flavors, making each sip more vibrant and satisfying. It's a sophisticated take on the mocha that appeals to those who appreciate the interplay of contrasting flavors in their coffee."
            },
            {
                id: "mocha006",
                name: "Hazelnut Mocha",
                description: "Nutty hazelnut chocolate flavor blended with espresso",
                basePrice: 195,
                sizes: {
                    small: { price: 195, ml: 240 },
                    medium: { price: 225, ml: 300 },
                    large: { price: 255, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875116/2026-01-02/00cdf085-77a8-4ae3-be6b-8bdb552c968d.png",
                popular: false,
                story: "The Hazelnut Mocha draws inspiration from the classic Italian combination of chocolate and hazelnuts, famously perfected in gianduja chocolate. We use premium chocolate that's been infused with natural hazelnut flavor, creating a nutty, aromatic mocha that's reminiscent of everyone's favorite chocolate-hazelnut spread. The hazelnut's natural oils add a luxurious mouthfeel to the drink, while its subtle sweetness complements both the chocolate and coffee. This mocha is particularly comforting on chilly days, offering warm, nutty notes that evoke feelings of coziness and indulgence."
            },
            {
                id: "mocha007",
                name: "Orange Chocolate Mocha",
                description: "Citrus-infused chocolate coffee with orange zest garnish",
                basePrice: 195,
                sizes: {
                    small: { price: 195, ml: 240 },
                    medium: { price: 225, ml: 300 },
                    large: { price: 255, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875116/2026-01-02/6619a7d7-dd93-446f-af0a-e219e2ae9b0d.png",
                popular: true,
                story: "The Orange Chocolate Mocha celebrates the timeless pairing of chocolate and orange, a combination beloved in European confectionery for centuries. We use dark chocolate infused with natural orange oil, creating bright citrus notes that beautifully complement the chocolate's richness. The orange's acidity also helps balance the sweetness, resulting in a well-rounded, sophisticated flavor profile. This festive beverage is traditionally associated with holiday celebrations but brings joy to any day of the year. The orange zest garnish adds both visual appeal and an extra burst of citrus aroma with each sip."
            },
            {
                id: "mocha008",
                name: "Coconut Mocha",
                description: "Tropical coconut chocolate blend with espresso",
                basePrice: 200,
                sizes: {
                    small: { price: 200, ml: 240 },
                    medium: { price: 230, ml: 300 },
                    large: { price: 260, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875116/2026-01-02/356ac9d2-cdd8-439e-b27f-cf2c053c6d02.png",
                popular: false,
                story: "Our Coconut Mocha transports you to tropical shores with its creamy coconut flavor combined with rich chocolate and espresso. We use real coconut cream and toasted coconut flakes to create an authentic tropical experience. The coconut's natural sweetness and creamy texture complement the chocolate beautifully, while its subtle nutty flavor adds complexity to the drink. This mocha is particularly popular during summer months or whenever you need a taste of the tropics. The combination of coconut and chocolate has roots in Caribbean and Southeast Asian culinary traditions, making this mocha a truly global flavor experience."
            },
            {
                id: "mocha009",
                name: "Spiced Chocolate Mocha",
                description: "Warm spices with chocolate and espresso for a cozy treat",
                basePrice: 195,
                sizes: {
                    small: { price: 195, ml: 240 },
                    medium: { price: 225, ml: 300 },
                    large: { price: 255, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/875116/2026-01-02/81efe62d-f85f-4a01-b020-b17b69042d86.png",
                popular: true,
                story: "The Spiced Chocolate Mocha draws inspiration from ancient Mesoamerican traditions where chocolate was originally consumed as a spiced beverage. We use a blend of warming spices including cinnamon, nutmeg, cardamom, and a hint of chili pepper - the same spices that were used by the Aztecs and Mayans. These spices not only add warmth and complexity but also enhance the chocolate's natural flavors. The gentle heat from the chili pepper creates a delightful warming sensation that builds with each sip. This mocha is perfect for cold weather, offering both physical warmth from the spices and emotional comfort from the chocolate-coffee combination."
            }
        ]
    },

    // ==========================================
    // FLAVORED COFFEE DELIGHTS
    // ==========================================
    "caramel-dream-flavored": {
        category: "Caramel Dream & Flavored Delights",
        description: "Smooth espresso with signature caramel sauce, whipped cream, and various flavor options",
        items: [
            {
                id: "caramel001",
                name: "Caramel Macchiato",
                description: "Layered espresso with vanilla, steamed milk, and caramel drizzle",
                basePrice: 185,
                sizes: {
                    small: { price: 185, ml: 240 },
                    medium: { price: 215, ml: 300 },
                    large: { price: 245, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879369/2026-01-02/27579c92-5988-490e-b0b6-3ea5270401b7.png",
                popular: true,
                story: "The Caramel Macchiato is a modern coffee classic that perfectly balances sweet and bold flavors. This drink starts with vanilla syrup at the bottom, followed by steamed milk, then freshly pulled espresso shots that create beautiful layers. The crowning glory is our signature caramel sauce drizzled in an artistic crosshatch pattern on top. Unlike traditional macchiatos, this drink is meant to be enjoyed by stirring the layers together, creating a harmonious blend of vanilla sweetness, rich espresso, and buttery caramel. It's become a beloved favorite for those who want their coffee sweet but not overwhelming."
            },
            {
                id: "caramel002",
                name: "Vanilla Latte",
                description: "Classic latte enhanced with premium vanilla bean syrup",
                basePrice: 175,
                sizes: {
                    small: { price: 175, ml: 240 },
                    medium: { price: 205, ml: 300 },
                    large: { price: 235, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879369/2026-01-02/fb546b2c-1f47-4a72-954d-d41b889916e8.png",
                popular: true,
                story: "Our Vanilla Latte transforms the classic latte into a subtly sweet, aromatic experience. We use premium vanilla bean syrup made from real Madagascar vanilla beans, which adds a warm, floral sweetness that complements rather than overpowers the espresso. The vanilla's natural compounds enhance the coffee's inherent flavors while adding a creamy, smooth character. This drink is perfect for those who find plain lattes too bitter but don't want the intensity of caramel or chocolate. The vanilla's gentle sweetness creates a comforting, familiar flavor that appeals to coffee lovers of all ages."
            },
            {
                id: "caramel003",
                name: "Hazelnut Caramel Latte",
                description: "Nutty hazelnut combined with sweet caramel and espresso",
                basePrice: 195,
                sizes: {
                    small: { price: 195, ml: 240 },
                    medium: { price: 225, ml: 300 },
                    large: { price: 255, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879369/2026-01-02/21b4ab8b-684b-43d5-8e34-9afee9adab18.png",
                popular: false,
                story: "The Hazelnut Caramel Latte is a decadent fusion of two beloved flavors. Premium hazelnut syrup provides a rich, nutty foundation, while our house-made caramel sauce adds buttery sweetness. The combination creates a complex flavor profile reminiscent of praline candies and European confections. The hazelnut's earthy notes ground the sweetness of the caramel, while both flavors enhance the espresso's natural chocolate undertones. Topped with whipped cream and crushed hazelnuts, this drink is a luxurious treat that satisfies both your coffee and dessert cravings in one indulgent cup."
            },
            {
                id: "caramel004",
                name: "Salted Caramel Latte",
                description: "Sweet caramel balanced with sea salt and rich espresso",
                basePrice: 190,
                sizes: {
                    small: { price: 190, ml: 240 },
                    medium: { price: 220, ml: 300 },
                    large: { price: 250, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879369/2026-01-02/9e34b7a8-6c3b-489f-a468-c8d18bee593f.png",
                popular: true,
                story: "The Salted Caramel Latte represents the perfect balance of sweet and savory. Our artisan caramel sauce is infused with premium sea salt, creating a sophisticated flavor that's become wildly popular in modern coffee culture. The salt doesn't just add a savory note - it actually enhances the caramel's sweetness while cutting through any cloying richness. This interplay of flavors also brings out the espresso's natural complexity, making each sip more interesting than the last. Finished with whipped cream and a sprinkle of sea salt crystals, this drink offers a gourmet coffee experience that's both comforting and exciting."
            },
            {
                id: "caramel005",
                name: "Toffee Nut Latte",
                description: "Buttery toffee and toasted nuts with smooth espresso",
                basePrice: 195,
                sizes: {
                    small: { price: 195, ml: 240 },
                    medium: { price: 225, ml: 300 },
                    large: { price: 255, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879369/2026-01-02/2b6e071b-25e1-4655-9cd3-edebfcb995ee.png",
                popular: false,
                story: "The Toffee Nut Latte is a celebration of rich, buttery flavors that evoke memories of holiday treats and cozy winter evenings. Our toffee nut syrup combines the deep, caramelized sweetness of English toffee with the warm, toasted notes of pecans and almonds. This creates a multi-layered flavor experience that's both familiar and sophisticated. The toffee's butterscotch notes complement the espresso's natural caramel undertones, while the nutty elements add depth and complexity. Topped with whipped cream and crushed toffee pieces, this drink is like enjoying a liquid version of your favorite candy bar."
            },
            {
                id: "caramel006",
                name: "Cinnamon Dolce Latte",
                description: "Sweet cinnamon sugar with caramel and espresso",
                basePrice: 185,
                sizes: {
                    small: { price: 185, ml: 240 },
                    medium: { price: 215, ml: 300 },
                    large: { price: 245, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879369/2026-01-02/e95a1e34-88ab-4273-924d-1940e5582248.png",
                popular: true,
                story: "The Cinnamon Dolce Latte brings the warmth of cinnamon sugar cookies to your coffee cup. 'Dolce' means sweet in Italian, and this drink lives up to its name with a perfect blend of cinnamon syrup, steamed milk, and espresso. The cinnamon adds a warming spice that's both comforting and invigorating, while the sweetness balances the espresso's boldness. We finish it with whipped cream, a caramel drizzle, and a dusting of cinnamon sugar that creates a delightful aroma with every sip. This drink is especially popular during fall and winter, offering the cozy flavors of home-baked treats in a convenient, delicious form."
            },
            {
                id: "caramel007",
                name: "Butterscotch Latte",
                description: "Rich butterscotch flavor with creamy milk and espresso",
                basePrice: 190,
                sizes: {
                    small: { price: 190, ml: 240 },
                    medium: { price: 220, ml: 300 },
                    large: { price: 250, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879369/2026-01-02/e84bd5c6-f121-40d9-a094-fb7d30a3c73e.png",
                popular: false,
                story: "The Butterscotch Latte is a nostalgic journey back to childhood treats, reimagined for the sophisticated coffee lover. Butterscotch, made from brown sugar and butter, has a deeper, more complex sweetness than regular caramel. Our house-made butterscotch syrup brings notes of brown butter, vanilla, and molasses that create a rich, warming flavor profile. This pairs beautifully with espresso, as both share similar caramelized notes. The result is a harmonious drink that's sweet but not cloying, rich but not heavy. Topped with butterscotch sauce and whipped cream, it's comfort in a cup."
            },
            {
                id: "caramel008",
                name: "Honey Almond Latte",
                description: "Natural honey sweetness with almond milk and espresso",
                basePrice: 185,
                sizes: {
                    small: { price: 185, ml: 240 },
                    medium: { price: 215, ml: 300 },
                    large: { price: 245, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879369/2026-01-02/f1e94c14-faf6-42d3-874a-75a0847e2870.png",
                popular: true,
                story: "The Honey Almond Latte offers a naturally sweet, wholesome alternative to syrup-based drinks. We use raw, unfiltered honey that brings floral notes and natural sweetness, while almond milk adds a subtle nutty flavor and creamy texture. This combination creates a drink that feels both indulgent and health-conscious. The honey's complex sugars provide sustained energy without the crash of refined sugar, while almonds contribute protein and healthy fats. The espresso's boldness is softened but not hidden, creating a balanced drink that's perfect for any time of day. Garnished with sliced almonds and a honey drizzle, it's as beautiful as it is delicious."
            }
        ]
    },

    // ==========================================
    // COLD BREW SPECIALTIES
    // ==========================================
    "cold-brew-creations": {
        category: "Cold Brew Creations",
        description: "Refreshing cold brew coffee steeped for 24 hours, served over ice with smooth finish",
        items: [
            {
                id: "cold001",
                name: "Iced Coffee",
                description: "Classic iced coffee with cold milk and ice for a refreshing experience",
                basePrice: 160,
                sizes: {
                    small: { price: 160, ml: 240 },
                    medium: { price: 190, ml: 300 },
                    large: { price: 220, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879383/2026-01-02/049074ab-18bb-4ec5-af99-4da997ca5d03.png",
                popular: true,
                story: "Iced Coffee is the perfect refreshment for warm days, combining freshly brewed coffee with ice and cold milk. Unlike cold brew, iced coffee is brewed hot and then rapidly cooled, preserving bright, vibrant coffee flavors with a crisp finish. Our method ensures the coffee retains its aromatic qualities while delivering a smooth, refreshing taste. The quick cooling process locks in the coffee's natural sweetness and acidity, creating a balanced drink that's both energizing and cooling. It's a timeless classic that has been enjoyed worldwide for generations, offering the familiar comfort of hot coffee in a refreshingly cold format."
            },
            {
                id: "cold002",
                name: "Cold Brew",
                description: "Smooth cold brew steeped for 24 hours, naturally sweet with low acidity",
                basePrice: 200,
                sizes: {
                    small: { price: 200, ml: 240 },
                    medium: { price: 230, ml: 300 },
                    large: { price: 260, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879383/2026-01-02/1bb3b0fe-ac4c-420f-bd3e-48d652fcbb41.png",
                popular: true,
                story: "Our Cold Brew is a labor of love, crafted through a patient 24-hour steeping process that extracts the coffee's sweetest, smoothest flavors. Unlike traditional brewing methods that use heat, cold brewing uses time and cold water to slowly extract the coffee's essence, resulting in a naturally sweet, low-acid beverage with a velvety smooth texture. This gentle extraction process highlights chocolate and caramel notes while minimizing bitterness and acidity, making it easier on the stomach and incredibly refreshing. The result is a concentrated coffee that's bold yet smooth, perfect for sipping slowly on a hot day or as a sophisticated afternoon pick-me-up."
            },
            {
                id: "cold003",
                name: "Frappé / Blended Coffee",
                description: "Creamy blended coffee drink with ice, topped with whipped cream",
                basePrice: 220,
                sizes: {
                    small: { price: 220, ml: 300 },
                    medium: { price: 250, ml: 400 },
                    large: { price: 280, ml: 500 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879383/2026-01-02/bba4b636-c2df-4bff-be0b-719d75dbc8d3.png",
                popular: true,
                story: "The Frappé originated in Greece in 1957 and has since become a global phenomenon, beloved for its thick, creamy texture and indulgent flavor. Our version blends premium coffee with ice, milk, and a touch of sweetness to create a smooth, slushy consistency that's both refreshing and satisfying. Topped with a generous swirl of whipped cream and a drizzle of chocolate or caramel, it's more than just a drink—it's a dessert experience. The blending process creates tiny ice crystals that give the frappé its signature texture, while the coffee flavor remains bold and present. Perfect for those who want their caffeine fix in the most indulgent way possible."
            },
            {
                id: "cold004",
                name: "Nitro Cold Brew",
                description: "Cold brew infused with nitrogen for a creamy, cascading effect",
                basePrice: 240,
                sizes: {
                    small: { price: 240, ml: 240 },
                    medium: { price: 270, ml: 300 },
                    large: { price: 300, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879383/2026-01-02/e0555539-5476-47cb-a647-e04ee360e54d.png",
                popular: false,
                story: "Nitro Cold Brew is the cutting edge of coffee innovation, infusing our signature cold brew with nitrogen gas to create a mesmerizing cascading effect and a creamy, velvety texture without any dairy. Inspired by the nitrogen infusion technique used in draft beers, this method creates tiny nitrogen bubbles that give the coffee a thick, foamy head and a smooth, almost creamy mouthfeel. The nitrogen also enhances the coffee's natural sweetness, making it taste rich and indulgent without any added sugar or cream. Served on tap and poured into a glass, watching the nitrogen cascade through the dark coffee is a visual spectacle that's as impressive as the taste itself."
            },
            {
                id: "cold005",
                name: "Vanilla Sweet Cream Cold Brew",
                description: "Cold brew with layers of vanilla sweet cream for a beautiful presentation",
                basePrice: 230,
                sizes: {
                    small: { price: 230, ml: 300 },
                    medium: { price: 260, ml: 400 },
                    large: { price: 290, ml: 500 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879383/2026-01-02/abb7df78-47ab-4e89-bc06-e6dc9f015093.png",
                popular: true,
                story: "The Vanilla Sweet Cream Cold Brew is a visual and flavor masterpiece, featuring our smooth cold brew topped with a house-made vanilla sweet cream that cascades beautifully through the coffee. The sweet cream is made from a blend of heavy cream, milk, and vanilla syrup, creating a rich, velvety topping that slowly swirls into the cold brew as you drink. This creates an ever-changing flavor experience—starting with the sweet, creamy vanilla notes and gradually transitioning to the bold, smooth cold brew underneath. The layered presentation makes it Instagram-worthy, while the flavor combination makes it utterly addictive. It's the perfect balance of indulgence and refreshment."
            },
            {
                id: "cold006",
                name: "Caramel Cold Brew",
                description: "Cold brew with rich caramel sauce and whipped cream topping",
                basePrice: 235,
                sizes: {
                    small: { price: 235, ml: 300 },
                    medium: { price: 265, ml: 400 },
                    large: { price: 295, ml: 500 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879383/2026-01-02/341cad69-93b4-4c08-be22-3ec4b46efc90.png",
                popular: true,
                story: "Our Caramel Cold Brew takes the smooth, naturally sweet cold brew and elevates it with ribbons of rich, buttery caramel sauce. The caramel is carefully drizzled throughout the drink, creating beautiful swirls that mix with the coffee as you sip. Topped with a cloud of whipped cream and an extra drizzle of caramel, this drink is pure indulgence. The caramel's sweetness complements the cold brew's chocolate notes, while its buttery richness adds a luxurious mouthfeel. It's the perfect treat for caramel lovers who want their coffee cold and their flavors bold. Each sip offers a perfect balance of sweet caramel and robust coffee."
            },
            {
                id: "cold007",
                name: "Mocha Cold Brew",
                description: "Cold brew blended with chocolate syrup and topped with whipped cream",
                basePrice: 240,
                sizes: {
                    small: { price: 240, ml: 300 },
                    medium: { price: 270, ml: 400 },
                    large: { price: 300, ml: 500 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879383/2026-01-02/24c6da84-394d-4e8a-aa03-dc137df0085e.png",
                popular: false,
                story: "The Mocha Cold Brew combines the best of both worlds—the smooth, low-acid profile of cold brew with the rich, decadent flavor of premium chocolate. We blend our 24-hour cold brew with Belgian chocolate syrup, creating a drink that's both refreshing and indulgent. The chocolate adds a velvety sweetness that complements the coffee's natural cocoa notes, while the cold temperature keeps everything crisp and refreshing. Topped with whipped cream and chocolate shavings, it's like enjoying a chocolate milkshake with a serious caffeine kick. Perfect for chocolate lovers who want their dessert and their coffee in one delicious, cold package."
            },
            {
                id: "cold008",
                name: "Coconut Cold Brew",
                description: "Tropical cold brew with coconut milk and toasted coconut flakes",
                basePrice: 245,
                sizes: {
                    small: { price: 245, ml: 300 },
                    medium: { price: 275, ml: 400 },
                    large: { price: 305, ml: 500 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879383/2026-01-02/12b1cc82-8aff-4b96-882d-9600b7a20e4d.png",
                popular: false,
                story: "Transport yourself to a tropical paradise with our Coconut Cold Brew, featuring smooth cold brew coffee blended with creamy coconut milk and topped with toasted coconut flakes. The coconut milk adds a natural sweetness and creamy texture that perfectly complements the cold brew's smooth profile, while the toasted coconut flakes provide a delightful crunch and aromatic finish. This drink is inspired by tropical coffee traditions from Southeast Asia and the Caribbean, where coconut and coffee have been paired for centuries. The result is a refreshing, exotic drink that's both energizing and transportive—perfect for those who want to escape to the tropics with every sip."
            }
        ]
    },

    // ==========================================
    // SPECIALTY DRINKS
    // ==========================================
    "special-choices": {
        category: "Special Choices",
        description: "Unique specialty drinks with artistic presentations, seasonal flavors, and creative toppings",
        items: [
            {
                id: "special001",
                name: "Decaffeinated Coffee",
                description: "Premium decaf coffee with all the flavor, none of the caffeine",
                basePrice: 180,
                sizes: {
                    small: { price: 180, ml: 240 },
                    medium: { price: 210, ml: 300 },
                    large: { price: 240, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-02/a1c581c2-36f5-46d5-8d85-2ee7a2416135.png",
                popular: true,
                story: "Our Decaffeinated Coffee proves that you don't need caffeine to enjoy exceptional coffee. Using the Swiss Water Process, we remove 99.9% of caffeine while preserving the coffee's natural flavors and aromatic oils. This chemical-free method uses only water, temperature, and time to gently remove caffeine, ensuring that every cup maintains the rich, complex flavors of our premium Arabica beans. Perfect for evening enjoyment or for those sensitive to caffeine, this coffee offers warm notes of chocolate, caramel, and nuts without any jitters. It's the ideal choice for coffee lovers who want to savor the ritual and taste of great coffee at any time of day."
            },
            {
                id: "special002",
                name: "Vegan Coffee (Plant Milk)",
                description: "Smooth espresso with your choice of premium plant-based milk",
                basePrice: 200,
                sizes: {
                    small: { price: 200, ml: 240 },
                    medium: { price: 230, ml: 300 },
                    large: { price: 260, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-02/1ea55f33-79f3-4b0e-9e35-43af4f285ee9.png",
                popular: true,
                story: "Our Vegan Coffee celebrates the diversity of plant-based milks, offering a completely dairy-free coffee experience without compromising on taste or texture. Choose from oat milk (creamy and naturally sweet), almond milk (light and nutty), soy milk (protein-rich and smooth), or coconut milk (tropical and indulgent). Each plant milk is carefully selected for its ability to complement espresso while creating beautiful microfoam for latte art. Oat milk, in particular, has become a barista favorite for its creamy texture and natural sweetness that rivals dairy. This drink is perfect for vegans, lactose-intolerant coffee lovers, or anyone exploring sustainable, plant-based options."
            },
            {
                id: "special003",
                name: "Irish Coffee",
                description: "Classic Irish whiskey coffee with whipped cream crown",
                basePrice: 250,
                sizes: {
                    small: { price: 250, ml: 180 },
                    medium: { price: 280, ml: 240 },
                    large: { price: 310, ml: 300 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-02/e11a7aff-aa17-475c-bcd1-c27320c162ec.png",
                popular: false,
                story: "Irish Coffee is a legendary drink that originated in the 1940s at Foynes Port in Ireland, created to warm cold travelers. This sophisticated cocktail combines hot coffee with Irish whiskey and brown sugar, topped with a thick layer of lightly whipped cream. The magic happens when you sip the hot, whiskey-laced coffee through the cool cream—a sensory experience that's both warming and refreshing. We use premium Irish whiskey that adds notes of vanilla, oak, and subtle smokiness to complement the coffee's richness. The cream floats perfectly on top, creating a beautiful layered presentation. It's the ultimate after-dinner drink, perfect for special occasions or whenever you want to add a touch of Irish warmth to your evening."
            },
            {
                id: "special004",
                name: "Affogato",
                description: "Italian dessert coffee with espresso poured over vanilla gelato",
                basePrice: 220,
                sizes: {
                    small: { price: 220, ml: 120 },
                    medium: { price: 250, ml: 180 },
                    large: { price: 280, ml: 240 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-02/a30026ad-3da6-4652-a470-c374a75504fc.png",
                popular: true,
                story: "Affogato, meaning 'drowned' in Italian, is a simple yet sublime dessert that perfectly marries coffee and ice cream. We serve a scoop of premium vanilla gelato in a chilled glass, then pour a shot of hot espresso over it at your table, creating a dramatic presentation as the ice cream begins to melt. The contrast between hot and cold, bitter and sweet, creates a complex flavor experience that evolves with each spoonful. The espresso's heat gently melts the gelato, creating a creamy coffee sauce that's utterly irresistible. This elegant dessert-drink hybrid is perfect after dinner or as an afternoon treat, offering the best of both worlds in one indulgent creation."
            },
            {
                id: "special005",
                name: "Cortado",
                description: "Perfectly balanced Spanish coffee with equal parts espresso and milk",
                basePrice: 160,
                sizes: {
                    small: { price: 160, ml: 120 },
                    medium: { price: 190, ml: 180 },
                    large: { price: 220, ml: 240 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-02/29f6c568-263a-4c11-b939-a2ac6271df25.png",
                popular: true,
                story: "The Cortado is a Spanish coffee tradition that achieves perfect harmony between espresso and milk. The name comes from the Spanish verb 'cortar,' meaning 'to cut,' referring to how the milk cuts through the espresso's intensity. Unlike Italian milk drinks, the cortado uses equal parts espresso and steamed milk with minimal foam, creating a drink that's stronger than a latte but smoother than a macchiato. The milk is steamed to a lower temperature to preserve its natural sweetness. Traditionally served in a small glass, the cortado is the preferred afternoon coffee in Spain and Cuba, offering just the right amount of caffeine and creaminess without overwhelming the palate."
            },
            {
                id: "special006",
                name: "Ristretto",
                description: "Concentrated espresso shot, sweeter and more intense than regular espresso",
                basePrice: 140,
                sizes: {
                    small: { price: 140, ml: 20 },
                    medium: { price: 170, ml: 40 },
                    large: { price: 200, ml: 60 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-02/42697272-82fc-4517-a6b4-2d3a82556ae2.png",
                popular: false,
                story: "Ristretto, meaning 'restricted' in Italian, is the ultimate expression of espresso craftsmanship. This shot uses the same amount of coffee as regular espresso but half the water, extracted in just 15-20 seconds instead of the usual 25-30. This shorter extraction time pulls only the sweetest, most flavorful compounds from the coffee, leaving behind the bitter elements that emerge later. The result is a more concentrated, sweeter shot with a thicker body and more intense flavor. Ristretto showcases the coffee's best qualities—chocolate, caramel, and fruit notes—in their purest form. It's the choice of true espresso connoisseurs who appreciate coffee at its most refined and concentrated."
            },
            {
                id: "special007",
                name: "Café au Lait",
                description: "French breakfast coffee with equal parts coffee and hot milk",
                basePrice: 170,
                sizes: {
                    small: { price: 170, ml: 240 },
                    medium: { price: 200, ml: 300 },
                    large: { price: 230, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-02/0d5fe8cf-ddcf-463f-a53d-b9e061869eb1.png",
                popular: true,
                story: "Café au Lait is a French breakfast tradition that embodies the simple elegance of Parisian café culture. Unlike Italian espresso drinks, this classic uses strong drip coffee (not espresso) mixed with an equal amount of hot, steamed milk. Traditionally served in a wide, bowl-shaped cup that you can wrap both hands around, it's designed for leisurely morning enjoyment, often paired with a fresh croissant. The combination creates a mild, comforting coffee that's less intense than a latte but more substantial than regular coffee with milk. The French have perfected the art of starting the day with this gentle, warming drink that provides both caffeine and comfort in equal measure."
            },
            {
                id: "special008",
                name: "Vietnamese Coffee",
                description: "Strong coffee with sweetened condensed milk, traditional phin filter",
                basePrice: 190,
                sizes: {
                    small: { price: 190, ml: 180 },
                    medium: { price: 220, ml: 240 },
                    large: { price: 250, ml: 300 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-02/35dd7fb2-e8c4-43e6-a402-770238435481.png",
                popular: false,
                story: "Vietnamese Coffee is a bold, sweet coffee tradition that reflects Vietnam's unique coffee culture. We use a traditional phin filter—a small metal drip filter that sits atop your glass—to slowly brew dark-roasted Vietnamese coffee. The coffee drips directly into a glass containing sweetened condensed milk, creating beautiful layers. Once brewing is complete, you stir the layers together, creating a rich, sweet coffee that's unlike anything else. The combination of strong, slightly bitter coffee with creamy, sweet condensed milk creates a perfect balance. Served hot or over ice (cà phê sữa đá), this drink offers a taste of Southeast Asian coffee culture that's both exotic and addictively delicious."
            }
        ]
    },

    // ==========================================
    // CHOCOLATE BEVERAGES
    // ==========================================
    "chocolate-indulgence": {
        category: "Chocolate Indulgence (Non-Coffee)",
        description: "Rich and decadent chocolate beverages made with premium cocoa, perfect for non-coffee lovers",
        items: [
            {
                id: "choc001",
                name: "Hot Chocolate",
                description: "Classic hot chocolate made with premium cocoa and steamed milk",
                basePrice: 170,
                sizes: {
                    small: { price: 170, ml: 240 },
                    medium: { price: 200, ml: 300 },
                    large: { price: 230, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879413/2026-01-02/d1597c00-31f0-4496-a439-4cda6d1b9372.png",
                popular: true,
                story: "Our Hot Chocolate is a timeless classic that brings warmth and comfort with every sip. Made from premium cocoa powder and real chocolate, this beloved beverage is carefully crafted with steamed milk to create a rich, velvety texture. Unlike instant mixes, we use high-quality ingredients that deliver authentic chocolate flavor with perfect sweetness. Topped with whipped cream and a dusting of cocoa powder, each cup is a nostalgic journey back to childhood memories while satisfying sophisticated adult tastes. Perfect for those who want the comfort of a warm beverage without caffeine, our hot chocolate is a year-round favorite that never goes out of style."
            },
            {
                id: "choc002",
                name: "Dark Hot Chocolate",
                description: "Intense dark chocolate experience with 70% cocoa for sophisticated palates",
                basePrice: 180,
                sizes: {
                    small: { price: 180, ml: 240 },
                    medium: { price: 210, ml: 300 },
                    large: { price: 240, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879413/2026-01-02/dec19cb0-e61f-4914-9740-8205b022bca7.png",
                popular: true,
                story: "Dark Hot Chocolate is for true chocolate connoisseurs who appreciate the complex, bittersweet notes of premium dark chocolate. We use 70% cocoa dark chocolate that delivers an intense, sophisticated flavor profile with hints of dark berries and roasted nuts. The higher cocoa content means less sugar, allowing the pure chocolate flavor to shine through while providing antioxidant benefits. This luxurious drink offers a more grown-up take on hot chocolate, with a rich, deep flavor that's both indulgent and refined. Topped with dark chocolate shavings and a touch of whipped cream, it's the perfect choice for those who prefer their chocolate bold and unapologetically intense."
            },
            {
                id: "choc003",
                name: "White Hot Chocolate",
                description: "Creamy white chocolate delight with vanilla notes and smooth texture",
                basePrice: 180,
                sizes: {
                    small: { price: 180, ml: 240 },
                    medium: { price: 210, ml: 300 },
                    large: { price: 240, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879413/2026-01-02/b9107046-daa1-4c2b-a5da-c1c6567a7636.png",
                popular: false,
                story: "White Hot Chocolate offers a luxurious alternative to traditional hot chocolate, made with premium white chocolate that's rich in cocoa butter. Unlike dark chocolate, white chocolate delivers a creamy, sweet flavor with prominent vanilla and caramel notes. The result is an incredibly smooth, velvety beverage that's sweeter and milder than its dark counterpart. We carefully melt real white chocolate into steamed milk, creating a drink that's both indulgent and comforting. Topped with whipped cream and white chocolate curls, this elegant beverage is perfect for those who prefer a sweeter, creamier chocolate experience. It's like drinking liquid silk!"
            },
            {
                id: "choc004",
                name: "Mint Hot Chocolate",
                description: "Refreshing mint chocolate combination with cooling peppermint notes",
                basePrice: 185,
                sizes: {
                    small: { price: 185, ml: 240 },
                    medium: { price: 215, ml: 300 },
                    large: { price: 245, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879413/2026-01-02/bfa47719-ae46-4eb7-8a21-a1549cec1096.png",
                popular: false,
                story: "Mint Hot Chocolate brings together two beloved flavors in perfect harmony. This refreshing twist on classic hot chocolate features premium chocolate infused with natural peppermint oil, creating a cooling sensation that beautifully contrasts with the warm, rich chocolate. The mint helps cleanse your palate between sips, allowing you to fully appreciate the chocolate's depth with each taste. Inspired by the classic after-dinner combination of chocolate mints, this beverage is particularly popular during the holiday season but makes a delightful treat year-round. Topped with whipped cream, chocolate chips, and fresh mint leaves, it's a festive and refreshing chocolate experience."
            },
            {
                id: "choc005",
                name: "Hazelnut Hot Chocolate",
                description: "Nutty hazelnut chocolate blend with toasted hazelnut garnish",
                basePrice: 190,
                sizes: {
                    small: { price: 190, ml: 240 },
                    medium: { price: 220, ml: 300 },
                    large: { price: 250, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879413/2026-01-02/61425b2f-d12a-48c8-b452-b7dbda37498c.png",
                popular: true,
                story: "Hazelnut Hot Chocolate celebrates the classic Italian combination of chocolate and hazelnuts, famously perfected in gianduja. We blend premium chocolate with natural hazelnut flavor, creating a nutty, aromatic beverage that's reminiscent of everyone's favorite chocolate-hazelnut spread. The hazelnut's natural oils add a luxurious, velvety texture to the drink, while its subtle sweetness enhances the chocolate's richness. This comforting beverage is particularly popular on chilly days, offering warm, nutty notes that evoke feelings of coziness and indulgence. Topped with whipped cream and crushed toasted hazelnuts, it's a sophisticated treat that appeals to both children and adults alike."
            },
            {
                id: "choc006",
                name: "Salted Caramel Hot Chocolate",
                description: "Sweet and salty caramel chocolate with sea salt crystals",
                basePrice: 195,
                sizes: {
                    small: { price: 195, ml: 240 },
                    medium: { price: 225, ml: 300 },
                    large: { price: 255, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879413/2026-01-02/6a1cccbe-5533-4420-b618-01bb0e04d44f.png",
                popular: true,
                story: "Salted Caramel Hot Chocolate is a modern classic that perfectly balances sweet, salty, and rich chocolate flavors. We blend premium chocolate with our house-made salted caramel sauce, creating a complex flavor profile that's become wildly popular. The sea salt doesn't just add a savory note—it actually enhances the chocolate's sweetness while cutting through any cloying richness. This sophisticated interplay of flavors creates a drink that's both comforting and exciting, with each sip revealing new layers of taste. Topped with whipped cream, caramel drizzle, and a sprinkle of sea salt crystals, this indulgent beverage is perfect for those who appreciate the magic of contrasting flavors."
            },
            {
                id: "choc007",
                name: "Orange Hot Chocolate",
                description: "Citrus-infused chocolate with fresh orange zest garnish",
                basePrice: 185,
                sizes: {
                    small: { price: 185, ml: 240 },
                    medium: { price: 215, ml: 300 },
                    large: { price: 245, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879413/2026-01-02/6c580c1c-ff6a-404c-8eca-6d2e671da412.png",
                popular: false,
                story: "Orange Hot Chocolate celebrates the timeless pairing of chocolate and orange, a combination beloved in European confectionery for centuries. We infuse premium dark chocolate with natural orange oil, creating bright citrus notes that beautifully complement the chocolate's richness. The orange's acidity helps balance the sweetness, resulting in a well-rounded, sophisticated flavor profile. This festive beverage is traditionally associated with holiday celebrations but brings joy to any day of the year. Topped with whipped cream and fresh orange zest, each sip offers both the comforting warmth of chocolate and the refreshing brightness of citrus—a truly delightful sensory experience."
            },
            {
                id: "choc008",
                name: "Spiced Hot Chocolate",
                description: "Warm spiced chocolate with cinnamon, nutmeg, and hint of chili",
                basePrice: 190,
                sizes: {
                    small: { price: 190, ml: 240 },
                    medium: { price: 220, ml: 300 },
                    large: { price: 250, ml: 360 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/879413/2026-01-02/c17e7298-6358-46e4-b2c4-c3db71921bc4.png",
                popular: true,
                story: "Spiced Hot Chocolate draws inspiration from ancient Mesoamerican traditions where chocolate was originally consumed as a spiced beverage by the Aztecs and Mayans. We blend premium chocolate with warming spices including cinnamon, nutmeg, cardamom, and a subtle hint of chili pepper. These spices don't just add warmth—they enhance the chocolate's natural flavors and create a complex, multi-layered taste experience. The gentle heat from the chili pepper builds gradually, creating a delightful warming sensation that's perfect for cold weather. Topped with whipped cream and a dusting of cinnamon, this cozy beverage offers both physical warmth and emotional comfort in every sip."
            }
        ]
    },

    // ==========================================
    // CUSTOMIZATION ADD-ONS
    // ==========================================
    "addons-customization": {
        category: "Add-Ons & Customization",
        description: "Personalize your perfect cup with premium add-ons, alternative sweeteners, and special toppings",
        items: [
            {
                id: "addon001",
                name: "Extra Espresso Shot",
                description: "Add an extra shot of premium espresso for more caffeine and intensity",
                basePrice: 40,
                sizes: {
                    small: { price: 40, ml: 30 },
                    medium: { price: 40, ml: 30 },
                    large: { price: 40, ml: 30 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-03/5ff4d87c-905b-41b7-98a8-1c95972f4d5d.png",
                popular: true,
                story: "For those mornings when you need an extra boost or simply love the bold intensity of espresso, our Extra Espresso Shot add-on is the perfect solution. Each additional shot is pulled fresh from our premium Arabica beans, adding approximately 75mg of caffeine and deepening the coffee flavor profile of your drink. This customization is particularly popular among students during exam season, professionals facing tight deadlines, or anyone who appreciates a stronger, more robust coffee experience. The extra shot integrates seamlessly into lattes, cappuccinos, and americanos, enhancing the coffee-to-milk ratio and creating a more pronounced espresso character that true coffee enthusiasts crave."
            },
            {
                id: "addon002",
                name: "Sugar-Free / Stevia",
                description: "Natural zero-calorie sweetener, perfect for health-conscious coffee lovers",
                basePrice: 20,
                sizes: {
                    small: { price: 20, ml: 0 },
                    medium: { price: 20, ml: 0 },
                    large: { price: 20, ml: 0 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-03/0b7e536c-6e2d-430f-8600-4c24bc7147bb.png",
                popular: true,
                story: "Our Sugar-Free Stevia option offers a guilt-free way to sweeten your coffee without compromising on taste. Derived from the leaves of the Stevia rebaudiana plant, this natural sweetener has been used for centuries in South America and contains zero calories while being 200-300 times sweeter than regular sugar. Unlike artificial sweeteners, stevia doesn't leave a bitter aftertaste when properly dosed, making it ideal for those managing their sugar intake, following ketogenic or diabetic-friendly diets, or simply choosing healthier alternatives. We use premium stevia extract that blends smoothly into both hot and cold beverages, providing the sweetness you desire while supporting your wellness goals."
            },
            {
                id: "addon003",
                name: "Plant-Based Milk",
                description: "Upgrade to oat, almond, soy, or coconut milk for a dairy-free experience",
                basePrice: 30,
                sizes: {
                    small: { price: 30, ml: 0 },
                    medium: { price: 30, ml: 0 },
                    large: { price: 30, ml: 0 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-03/68047682-4ff8-4af8-8e4f-2b48baeb560f.png",
                popular: true,
                story: "Our Plant-Based Milk selection reflects the growing demand for sustainable, ethical, and health-conscious coffee options. Choose from four premium alternatives: creamy oat milk (our barista's favorite for its natural sweetness and perfect foam), light and nutty almond milk (low in calories, high in vitamin E), protein-rich soy milk (smooth and substantial), or indulgent coconut milk (adds tropical notes and natural sweetness). Each option is carefully selected for its ability to complement espresso while creating the microfoam necessary for beautiful latte art. Whether you're vegan, lactose-intolerant, environmentally conscious, or simply exploring new flavors, our plant-based milks offer delicious alternatives without sacrificing the creamy texture and taste you love."
            },
            {
                id: "addon004",
                name: "Whipped Cream",
                description: "Freshly whipped cream topping for an indulgent, luxurious finish",
                basePrice: 35,
                sizes: {
                    small: { price: 35, ml: 0 },
                    medium: { price: 35, ml: 0 },
                    large: { price: 35, ml: 0 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-03/ab054ddc-609e-4871-8719-66ba514f6833.png",
                popular: true,
                story: "Transform any coffee into a decadent dessert-like treat with our freshly whipped cream topping. Made in-house daily from premium heavy cream and lightly sweetened with vanilla, our whipped cream is piped generously on top of your drink, creating a cloud-like crown that slowly melts into the coffee below. This classic addition is perfect for mochas, hot chocolates, and flavored lattes, adding a luxurious mouthfeel and visual appeal. The cream acts as an insulator, keeping your drink hot longer while providing a cool, sweet contrast with each sip. Popular during fall and winter months, whipped cream elevates your coffee from everyday beverage to special indulgence, making every cup feel like a celebration."
            },
            {
                id: "addon005",
                name: "Flavored Syrups",
                description: "Choose from vanilla, caramel, hazelnut, or seasonal flavors to customize your drink",
                basePrice: 25,
                sizes: {
                    small: { price: 25, ml: 0 },
                    medium: { price: 25, ml: 0 },
                    large: { price: 25, ml: 0 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-03/24031b63-9988-4564-b010-755e7a711b72.png",
                popular: true,
                story: "Our collection of premium flavored syrups allows you to personalize your coffee exactly to your taste preferences. Each syrup is crafted with high-quality ingredients and real extracts—no artificial flavors here. Classic vanilla adds warm, floral notes that enhance the coffee's natural sweetness; rich caramel brings buttery depth and indulgent sweetness; hazelnut provides nutty, toasted flavors reminiscent of European cafés. We also rotate seasonal offerings like pumpkin spice in autumn, peppermint during holidays, and lavender in spring. These syrups blend seamlessly into both hot and iced drinks, allowing you to recreate your favorite coffeehouse beverages at home or discover new flavor combinations that become your signature drink."
            },
            {
                id: "addon006",
                name: "Chocolate Drizzle",
                description: "Premium chocolate sauce drizzled artistically for visual appeal and extra sweetness",
                basePrice: 30,
                sizes: {
                    small: { price: 30, ml: 0 },
                    medium: { price: 30, ml: 0 },
                    large: { price: 30, ml: 0 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-03/ee96935c-e684-44b6-94c4-2d34a62e0dac.png",
                popular: false,
                story: "Elevate your coffee's presentation and flavor with our artisan chocolate drizzle, made from premium Belgian chocolate. Our baristas carefully drizzle the warm chocolate in decorative patterns across whipped cream or directly into your drink, creating Instagram-worthy designs that taste as good as they look. The chocolate adds layers of rich, cocoa flavor that complement coffee's natural chocolate notes while providing bursts of sweetness with each sip. This add-on is particularly popular on mochas, cappuccinos, and cold brew drinks, transforming them into dessert-worthy creations. Choose from dark chocolate (70% cocoa for sophisticated bitterness), milk chocolate (smooth and sweet), or white chocolate (creamy and vanilla-forward) to match your mood and taste preferences."
            },
            {
                id: "addon007",
                name: "Cinnamon & Spice",
                description: "Aromatic cinnamon powder and warming spices for a cozy, flavorful enhancement",
                basePrice: 15,
                sizes: {
                    small: { price: 15, ml: 0 },
                    medium: { price: 15, ml: 0 },
                    large: { price: 15, ml: 0 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-03/62508654-5b84-4dc2-b332-b28e90115ba8.png",
                popular: true,
                story: "Add warmth and aromatic complexity to your coffee with our signature spice blend, featuring premium Ceylon cinnamon, nutmeg, and a hint of cardamom. This add-on draws inspiration from traditional spiced coffee preparations found in Middle Eastern and Indian coffee cultures, where spices have been used for centuries to enhance coffee's natural flavors. The cinnamon provides sweet warmth without adding sugar, nutmeg adds subtle earthiness, and cardamom contributes a unique, slightly citrusy note. Sprinkled on top of foam or stirred into your drink, these spices not only enhance flavor but also fill the air with an inviting aroma. Particularly popular during cooler months, this add-on transforms your coffee into a comforting, aromatic experience that engages all your senses."
            },
            {
                id: "addon008",
                name: "Extra Ice",
                description: "Additional ice for extra-cold refreshment, perfect for hot summer days",
                basePrice: 10,
                sizes: {
                    small: { price: 10, ml: 0 },
                    medium: { price: 10, ml: 0 },
                    large: { price: 10, ml: 0 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/877609/2026-01-03/2c2e5e1a-8f48-419e-8575-65a99fcba29e.png",
                popular: true,
                story: "For those who prefer their iced coffee extra cold and refreshing, our Extra Ice add-on ensures your drink stays perfectly chilled from first sip to last. We use filtered water frozen into perfectly sized cubes that cool your beverage without diluting the flavor too quickly. This option is especially popular during hot summer months or for customers who enjoy sipping their coffee slowly throughout the day. The additional ice creates a more pronounced temperature contrast, making each sip more refreshing and invigorating. Many of our regular customers combine this with our cold brew or iced lattes, creating an ultra-refreshing coffee experience that's perfect for beating the heat while still enjoying the full, rich flavor of premium coffee."
            }
        ]
    },

    // ==========================================
    // FOOD ITEMS - SAVORY SNACKS
    // ==========================================
    // Crispy Fried
    // ==========================================
    "savory-snacks-crispy": {
        category: "Crispy Fried",
        description: "Crispy golden samosas filled with spiced potatoes and peas, served with mint chutney",
        items: [
            {
                id: "crispy001",
                name: "Aloo Samosa",
                description: "Classic potato samosa with spiced filling and crispy golden crust",
                basePrice: 70,
                sizes: {
                    small: { price: 70, quantity: 1 },
                    medium: { price: 120, quantity: 2 },
                    large: { price: 170, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/e20476de-c201-490f-a5be-6476c4063151.png",
                popular: true,
                story: "Our Aloo Samosa is a beloved Indian street food classic, featuring a perfectly spiced potato and pea filling wrapped in a crispy, golden pastry. Each samosa is hand-folded and fried to perfection, creating that signature crunch that gives way to a warm, flavorful filling. The potatoes are seasoned with cumin, coriander, garam masala, and a hint of chili for warmth. Served with fresh mint-cilantro chutney and tamarind sauce, these samosas are the perfect savory companion to your coffee. They're especially popular during tea time and make for a satisfying snack any time of day."
            },
            {
                id: "crispy002",
                name: "Paneer Samosa",
                description: "Cottage cheese samosa with herbs and spices, crispy and flavorful",
                basePrice: 80,
                sizes: {
                    small: { price: 80, quantity: 1 },
                    medium: { price: 140, quantity: 2 },
                    large: { price: 200, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/925062/2026-01-22/72ad8ecb-eb5b-4140-8c7d-331100c670a1.png",
                popular: true,
                story: "The Paneer Samosa is a protein-rich variation that features crumbled cottage cheese mixed with aromatic spices, fresh herbs, and a touch of lemon juice. The paneer filling is lighter than the traditional potato version while still being incredibly satisfying. We use fresh paneer that's lightly spiced with green chilies, ginger, and fresh coriander, creating a filling that's both creamy and flavorful. The crispy exterior provides the perfect contrast to the soft, savory filling. This vegetarian delight pairs wonderfully with masala chai or South Indian filter coffee."
            },
            {
                id: "crispy003",
                name: "Corn & Cheese Samosa",
                description: "Sweet corn and cheese samosa with herbs, perfectly crispy and delicious",
                basePrice: 85,
                sizes: {
                    small: { price: 85, quantity: 1 },
                    medium: { price: 150, quantity: 2 },
                    large: { price: 215, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/12f46550-8ea9-4e24-8b37-fdb8a95a3af7.png",
                popular: false,
                story: "Our Corn & Cheese Samosa is a delightful fusion creation featuring sweet corn kernels mixed with creamy cheese and aromatic spices. The filling combines the natural sweetness of corn with the richness of melted cheese, enhanced with fresh coriander, green chilies, and a hint of black pepper. Each bite offers a perfect balance of sweet and savory flavors. The crispy golden pastry shell provides an excellent contrast to the creamy, cheesy filling. This innovative samosa is particularly popular among children and those who enjoy milder, slightly sweet flavors. Perfect with a cup of cappuccino or masala chai."
            },
            {
                id: "crispy004",
                name: "Vegetable Spring Rolls",
                description: "Crispy spring rolls filled with fresh vegetables and served with sweet chili sauce",
                basePrice: 85,
                sizes: {
                    small: { price: 85, quantity: 1 },
                    medium: { price: 150, quantity: 2 },
                    large: { price: 215, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/133b2fa9-05fc-4cfe-a213-9b5fa9f2bad7.png",
                popular: true,
                story: "Our Vegetable Spring Rolls offer a lighter, Asian-inspired alternative to traditional samosas. These crispy rolls are filled with a colorful mix of shredded cabbage, carrots, bell peppers, and glass noodles, all seasoned with soy sauce and sesame oil. Each roll is wrapped in a thin, crispy pastry and deep-fried until golden brown. The result is a crunchy exterior that gives way to a flavorful, slightly sweet vegetable filling. Served with sweet chili sauce for dipping, these spring rolls are perfect for those who want a lighter snack option that's still satisfying and delicious."
            },
            {
                id: "crispy005",
                name: "Cheese Samosa",
                description: "Fusion samosa with melted cheese and spiced potato filling",
                basePrice: 85,
                sizes: {
                    small: { price: 85, quantity: 1 },
                    medium: { price: 150, quantity: 2 },
                    large: { price: 215, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/925062/2026-01-22/4005a849-9dc4-4822-b1c0-07aba179fb91.png",
                popular: true,
                story: "The Cheese Samosa is a modern fusion creation that combines traditional Indian flavors with the universal appeal of melted cheese. Our classic potato filling is enhanced with generous amounts of mozzarella and cheddar cheese, creating a gooey, stretchy center that cheese lovers adore. The spiced potato base provides familiar Indian flavors while the melted cheese adds richness and indulgence. When served hot, the cheese pulls beautifully with each bite. This innovative samosa has become a favorite among younger customers and those who appreciate fusion cuisine."
            },
            {
                id: "crispy006",
                name: "Mixed Veg Pakoras",
                description: "Assorted vegetable fritters with chickpea flour batter, crispy and golden",
                basePrice: 75,
                sizes: {
                    small: { price: 75, quantity: 1 },
                    medium: { price: 130, quantity: 2 },
                    large: { price: 185, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/adc15281-6083-48ac-b8db-2589ba3cf53e.png",
                popular: true,
                story: "Mixed Veg Pakoras are a beloved Indian snack featuring an assortment of vegetables coated in spiced chickpea flour batter and deep-fried until crispy. Our pakora mix includes onions, potatoes, spinach, and cauliflower, each piece coated in a light, crispy batter seasoned with ajwain (carom seeds), red chili powder, and turmeric. The result is a plate of golden, crunchy fritters that are perfect for sharing. Served with mint chutney and tamarind sauce, these pakoras are especially popular during monsoon season and pair wonderfully with hot masala chai or filter coffee."
            }
        ]
    },


    // ==========================================
    // Fresh & Grilled
    // ==========================================
    "sandwiches-fresh-grilled": {
        category: "Fresh & Grilled",
        description: "Fresh sandwiches with layers of vegetables, cheese, and premium ingredients on artisan bread",
        items: [
            {
                id: "sandwich001",
                name: "Paneer Tikka Sandwich",
                description: "Grilled cottage cheese with tikka spices, vegetables, and mint chutney",
                basePrice: 140,
                sizes: {
                    small: { price: 140, quantity: 1 },
                    medium: { price: 240, quantity: 2 },
                    large: { price: 340, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/74a34ce7-0a71-4ead-96ec-87a83f3ca131.png",
                popular: true,
                story: "Our Paneer Tikka Sandwich brings the flavors of tandoori cuisine to a convenient sandwich format. Cubes of cottage cheese are marinated in yogurt and tikka spices, then grilled to perfection. The smoky, spiced paneer is layered with fresh lettuce, tomatoes, onions, and cucumber, all brought together with mint-cilantro chutney and served on toasted whole wheat bread. This protein-rich sandwich is both filling and flavorful, offering a perfect balance of spices and freshness. It's become a favorite among vegetarians looking for a substantial meal that pairs perfectly with iced coffee or cold brew."
            },
            {
                id: "sandwich002",
                name: "Grilled Cheese Sandwich",
                description: "Classic grilled cheese with melted cheddar on buttery toasted bread",
                basePrice: 120,
                sizes: {
                    small: { price: 120, quantity: 1 },
                    medium: { price: 200, quantity: 2 },
                    large: { price: 280, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/641fcc46-79cc-41e3-946e-221335e1a006.png",
                popular: true,
                story: "Sometimes simplicity is perfection, and our Grilled Cheese Sandwich proves this point beautifully. We use a blend of sharp cheddar and creamy mozzarella cheese sandwiched between slices of artisan bread that's been buttered and grilled until golden brown. The result is a crispy, buttery exterior that gives way to gooey, melted cheese inside. This comfort food classic is perfect for those who want something familiar and satisfying. It pairs wonderfully with tomato soup or a hot cappuccino, making it an ideal choice for a cozy lunch or afternoon snack."
            },
            {
                id: "sandwich003",
                name: "Mushroom Tikka Sandwich",
                description: "Grilled marinated mushrooms with tikka spices, fresh vegetables, and mint chutney",
                basePrice: 150,
                sizes: {
                    small: { price: 150, quantity: 1 },
                    medium: { price: 260, quantity: 2 },
                    large: { price: 370, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/0b97ccc1-499b-4067-9e4f-9ddf4c252363.png",
                popular: true,
                story: "The Mushroom Tikka Sandwich features meaty button mushrooms marinated in yogurt and aromatic tikka spices, then grilled to smoky perfection. The juicy, flavorful mushrooms absorb the spices beautifully, creating a rich umami taste that rivals any meat-based sandwich. Layered with crisp lettuce, ripe tomatoes, onions, and cucumber, all enhanced with our signature mint-cilantro chutney and served on toasted whole wheat bread. This sandwich offers a perfect balance of protein, vegetables, and bold Indian flavors. It's a substantial vegetarian meal that satisfies even the heartiest appetites and pairs excellently with iced latte or cold brew coffee."
            },
            {
                id: "sandwich004",
                name: "Veggie Delight Sandwich",
                description: "Fresh vegetables with pesto, mozzarella, and balsamic glaze",
                basePrice: 130,
                sizes: {
                    small: { price: 130, quantity: 1 },
                    medium: { price: 220, quantity: 2 },
                    large: { price: 310, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/74a34ce7-0a71-4ead-96ec-87a83f3ca131.png",
                popular: true,
                story: "Our Veggie Delight Sandwich is a celebration of fresh, colorful vegetables enhanced with Mediterranean flavors. Grilled zucchini, bell peppers, and eggplant are layered with fresh mozzarella, crisp lettuce, and ripe tomatoes. The sandwich is elevated with homemade basil pesto and a drizzle of balsamic glaze, creating a complex flavor profile that's both fresh and satisfying. Served on ciabatta bread, this sandwich offers a gourmet experience that's completely vegetarian. It's perfect for health-conscious customers who don't want to compromise on flavor, and it pairs beautifully with green tea or a light latte."
            },
            {
                id: "sandwich005",
                name: "Grilled Veggie & Pesto Sandwich",
                description: "Grilled eggplant, zucchini, bell peppers with basil pesto and mozzarella on ciabatta",
                basePrice: 135,
                sizes: {
                    small: { price: 135, quantity: 1 },
                    medium: { price: 230, quantity: 2 },
                    large: { price: 325, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/3e14e2e0-c445-4113-80b2-020e0671a58a.png",
                popular: false,
                story: "The Grilled Veggie & Pesto Sandwich is a Mediterranean-inspired creation featuring perfectly grilled eggplant, zucchini, and colorful bell peppers. Each vegetable is grilled to bring out its natural sweetness and add a subtle smoky flavor. Layered with fresh mozzarella cheese, crisp lettuce, and ripe tomatoes, the sandwich is generously spread with homemade basil pesto that ties all the flavors together. Served on toasted ciabatta bread, this sandwich offers a satisfying combination of textures and flavors. It's a wholesome choice for those seeking a lighter yet filling meal, and pairs wonderfully with iced green tea or a refreshing lemonade."
            },
            {
                id: "sandwich006",
                name: "Mediterranean Veggie Club Sandwich",
                description: "Triple-decker with grilled vegetables, hummus, avocado, lettuce, and tomato",
                basePrice: 170,
                sizes: {
                    small: { price: 170, quantity: 1 },
                    medium: { price: 290, quantity: 2 },
                    large: { price: 410, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/a639c0b0-0ad3-46ba-bbdc-eba761f385fc.png",
                popular: true,
                story: "Our Mediterranean Veggie Club Sandwich is the ultimate vegetarian indulgence, featuring three layers of toasted multigrain bread stacked with grilled zucchini, bell peppers, eggplant, creamy hummus spread, fresh avocado slices, crisp lettuce, ripe tomatoes, and cucumber. This towering sandwich is held together with toothpicks and served with a side of crispy french fries and coleslaw. Each bite offers a perfect combination of textures and flavors—smoky grilled vegetables, creamy hummus and avocado, and fresh crisp vegetables. It's a substantial meal that's perfect for sharing or for those with a hearty appetite. The veggie club pairs excellently with iced tea, cold brew, or a refreshing lemonade."
            }
        ]
    },

    // ==========================================
    // Indian Street Food
    // ==========================================
    "savory-snacks-indian-street-food": {
        category: "Indian Street Food",
        description: "Authentic street food selection featuring momos, chaat, and traditional Indian snacks",
        items: [
            {
                id: "indian001",
                name: "Steamed Momos",
                description: "Soft steamed dumplings filled with spiced vegetables, served with spicy red chutney and mayo",
                basePrice: 120,
                sizes: {
                    small: { price: 120, quantity: 1 },
                    medium: { price: 220, quantity: 2 },
                    large: { price: 320, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/928808/2026-01-24/9ef647ba-636b-4fae-9435-ebe6aad3839b.png",
                popular: true,
                story: "Our Steamed Momos are a beloved Tibetan-Indian street food favorite that has taken India by storm. These delicate dumplings are filled with a flavorful mixture of finely chopped vegetables, ginger, garlic, and aromatic spices, all wrapped in a soft, thin dough. Each momo is carefully hand-folded and steamed to perfection, resulting in a tender, juicy bite. Served piping hot with our signature spicy red chutney and creamy mayo dip, these momos are comfort food at its finest. Perfect as a light snack or appetizer, they pair wonderfully with hot ginger tea or masala chai."
            },
            {
                id: "indian002",
                name: "Pani Puri (Golgappa)",
                description: "Crispy hollow puris filled with spicy tangy water, potatoes, chickpeas, and sweet chutney",
                basePrice: 80,
                sizes: {
                    small: { price: 80, quantity: 1 },
                    medium: { price: 140, quantity: 2 },
                    large: { price: 200, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/928808/2026-01-24/69eeb3ff-9003-4bb4-a257-6346addbf192.png",
                popular: true,
                story: "Pani Puri, also known as Golgappa, is the king of Indian street food and a burst of flavors in every bite. These crispy, hollow semolina shells are filled with a mixture of boiled potatoes, chickpeas, and tangy tamarind chutney, then topped with spicy mint-cilantro water (pani). The experience is all about the explosion of sweet, spicy, tangy, and savory flavors that dance on your palate. Traditionally eaten in one bite, pani puri is not just food—it's an experience! Our pani is freshly prepared with mint, coriander, green chilies, and secret spices. Perfect for sharing and guaranteed to bring smiles!"
            },
            {
                id: "indian003",
                name: "Pav Bhaji",
                description: "Spicy mashed vegetable curry served with buttered bread rolls, onions, and lemon",
                basePrice: 100,
                sizes: {
                    small: { price: 100, quantity: 1 },
                    medium: { price: 180, quantity: 2 },
                    large: { price: 260, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/928808/2026-01-24/51362402-fbf5-485a-a97d-1f0d2040bc6f.png",
                popular: true,
                story: "Pav Bhaji is Mumbai's most iconic street food, originating from the bustling streets of Maharashtra. This hearty dish features a thick, spicy curry made from mashed mixed vegetables including potatoes, tomatoes, peas, and bell peppers, all cooked with a special pav bhaji masala blend. The bhaji is served with soft bread rolls (pav) that are toasted with butter on a hot griddle until golden and crispy. Garnished with chopped onions, fresh coriander, and a squeeze of lemon, this dish is comfort food at its best. The combination of the spicy, tangy bhaji with buttery pav is absolutely irresistible. Pairs perfectly with cold buttermilk or masala chai."
            },
            {
                id: "indian004",
                name: "Vada Pav",
                description: "Mumbai's famous street burger - spiced potato fritter in a soft bun with chutneys and fried green chilies",
                basePrice: 60,
                sizes: {
                    small: { price: 60, quantity: 1 },
                    medium: { price: 110, quantity: 2 },
                    large: { price: 160, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/928808/2026-01-24/159dcb73-8c02-4c3c-88c8-6e978f326901.png",
                popular: true,
                story: "Vada Pav is Mumbai's answer to the burger and is affectionately called the 'poor man's burger,' though its taste is anything but ordinary. This iconic street food consists of a deep-fried potato dumpling (batata vada) placed inside a soft bread roll (pav), along with spicy garlic chutney, sweet tamarind chutney, and fried green chilies. The vada is made from mashed potatoes mixed with mustard seeds, curry leaves, and spices, coated in chickpea flour batter, and fried until golden and crispy. It's the ultimate grab-and-go snack that's filling, flavorful, and incredibly satisfying. A true taste of Mumbai's street food culture!"
            },
            {
                id: "indian005",
                name: "Papdi Chaat",
                description: "Crispy fried dough wafers topped with potatoes, chickpeas, yogurt, and tangy chutneys",
                basePrice: 90,
                sizes: {
                    small: { price: 90, quantity: 1 },
                    medium: { price: 160, quantity: 2 },
                    large: { price: 230, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/928808/2026-01-24/9c59eb0f-1f43-499f-a89d-355bf591b661.png",
                popular: false,
                story: "Papdi Chaat is a beloved North Indian street food that offers an incredible medley of textures and flavors. This colorful dish features crispy fried dough wafers (papdi) topped with boiled potatoes, chickpeas, creamy yogurt, sweet tamarind chutney, spicy green chutney, and sprinkled with chaat masala, roasted cumin powder, and crispy sev. The combination of crunchy, soft, creamy, sweet, spicy, and tangy elements creates a symphony of flavors in every bite. Garnished with fresh coriander and pomegranate seeds, this chaat is as beautiful as it is delicious. Perfect as an evening snack or appetizer."
            },
            {
                id: "indian006",
                name: "Dahi Vada",
                description: "Soft lentil fritters soaked in creamy yogurt, topped with chutneys and spices",
                basePrice: 85,
                sizes: {
                    small: { price: 85, quantity: 1 },
                    medium: { price: 150, quantity: 2 },
                    large: { price: 215, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/928808/2026-01-24/b8be5e62-2bd5-4ca6-9f4e-539ea260ebd5.png",
                popular: false,
                story: "Dahi Vada is a cooling and refreshing Indian street food that's perfect for hot days. These soft, spongy lentil fritters (vada) are made from ground urad dal, deep-fried until golden, then soaked in water to make them incredibly soft and fluffy. They're then immersed in thick, creamy yogurt that's been seasoned with salt and a touch of sugar. The dish is finished with sweet tamarind chutney, spicy green chutney, roasted cumin powder, red chili powder, and crispy sev. The contrast between the soft vadas and the smooth yogurt, along with the sweet and spicy chutneys, creates a delightful taste experience. A popular choice during festivals and celebrations."
            },
            {
                id: "indian007",
                name: "Aloo Tikki Chaat",
                description: "Crispy spiced potato patties topped with chickpeas, yogurt, chutneys, and sev",
                basePrice: 95,
                sizes: {
                    small: { price: 95, quantity: 1 },
                    medium: { price: 170, quantity: 2 },
                    large: { price: 245, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/928808/2026-01-24/b70a3cda-914a-4d12-b392-b420ce05cf8a.png",
                popular: true,
                story: "Aloo Tikki Chaat is a popular North Indian street food that combines crispy potato patties with a variety of toppings for an explosion of flavors. The aloo tikki (potato patty) is made from mashed potatoes mixed with spices, shaped into round cakes, and shallow-fried until golden and crispy on the outside while remaining soft inside. It's then topped with spiced chickpeas, creamy yogurt, sweet tamarind chutney, spicy green chutney, chopped onions, tomatoes, and finished with crispy sev and fresh coriander. Each bite offers a perfect balance of textures and flavors—crispy, soft, creamy, tangy, and spicy all at once. A must-try for chaat lovers!"
            },
            {
                id: "indian008",
                name: "Bhel Masala",
                description: "Puffed rice mixed with vegetables, sev, chutneys, and spices - a crunchy Mumbai favorite",
                basePrice: 70,
                sizes: {
                    small: { price: 70, quantity: 1 },
                    medium: { price: 125, quantity: 2 },
                    large: { price: 180, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/928808/2026-01-24/6fe6f703-3318-4cc1-9b0d-f9b77b806451.png",
                popular: false,
                story: "Bhel Puri is a quintessential Mumbai beach snack that's light, crunchy, and incredibly flavorful. This popular chaat is made with puffed rice as the base, mixed with finely chopped onions, tomatoes, boiled potatoes, and crispy sev (chickpea noodles). The magic happens when it's tossed with sweet tamarind chutney, spicy green chutney, lemon juice, and chaat masala. The result is a delightful mix of textures and flavors—crunchy, tangy, sweet, and spicy all at once. Garnished with fresh coriander and sometimes raw mango, bhel puri is best enjoyed immediately while it's still crispy. A guilt-free snack that's perfect for any time of the day!"
            }
        ]
    },


    // ==========================================
    // Mixed Platter
    // ==========================================
    "savory-snacks-mixed-platter": {
        category: "Mixed Platter",
        description: "Assorted savory platter with spring rolls, pakoras, and finger foods perfect for sharing",
        items: [
            {
                id: "platter001",
                name: "Vegetarian Mixed Platter",
                description: "Assorted vegetarian snacks including samosas, pakoras, spring rolls, and paneer tikka",
                basePrice: 250,
                sizes: {
                    small: { price: 250, quantity: 1 },
                    medium: { price: 450, quantity: 2 },
                    large: { price: 650, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/93878ceb-8b45-4012-9c43-42ed7fd28745.png",
                popular: true,
                story: "Our Vegetarian Mixed Platter is perfect for sharing with friends or family. This generous assortment includes our most popular savory snacks: crispy samosas filled with spiced potatoes, golden pakoras with mixed vegetables, crunchy spring rolls, and grilled paneer tikka pieces. Each item is freshly prepared and served hot with three types of chutneys: mint-cilantro, tamarind, and spicy red chili. This platter offers a complete taste tour of Indian street food favorites, making it ideal for gatherings, celebrations, or when you simply can't decide on just one snack. Pairs wonderfully with masala chai or cold beer."
            },
            {
                id: "platter002",
                name: "Cheese Lovers Platter",
                description: "Cheese-focused platter with mozzarella sticks, cheese balls, and loaded nachos",
                basePrice: 280,
                sizes: {
                    small: { price: 280, quantity: 1 },
                    medium: { price: 500, quantity: 2 },
                    large: { price: 720, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/28ccf4a0-0a29-4ab9-bef7-665ec2a0b912.png",
                popular: false,
                story: "Our Cheese Lovers Platter is a dream come true for cheese enthusiasts. This indulgent assortment features crispy mozzarella sticks with marinara sauce, golden cheese balls with a gooey center, loaded nachos topped with melted cheese and jalapeños, and cheese-stuffed jalapeño poppers. Every item is designed to deliver maximum cheese pull and satisfaction. The platter is served with multiple dipping sauces including ranch, marinara, and spicy cheese sauce. Perfect for sharing with fellow cheese lovers or as a decadent treat for yourself. Pairs excellently with cold beverages or light beer."
            },
            {
                id: "platter003",
                name: "Asian Fusion Vegetarian Platter",
                description: "Pan-Asian selection with spring rolls, vegetable dumplings, tofu satay, and veggie tempura",
                basePrice: 300,
                sizes: {
                    small: { price: 300, quantity: 1 },
                    medium: { price: 550, quantity: 2 },
                    large: { price: 800, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/fdaccafd-d374-4bc9-b0a7-9e1f719f42fa.png",
                popular: true,
                story: "The Asian Fusion Vegetarian Platter takes you on a culinary journey across Asia with carefully selected vegetarian appetizers from different cuisines. This exotic platter includes crispy vegetable spring rolls, steamed or fried vegetable dumplings with savory filling, grilled tofu satay skewers with peanut sauce, and light vegetable tempura with a delicate batter. Each item represents authentic Asian flavors and cooking techniques. Served with sweet chili sauce, soy-ginger dip, and peanut sauce, this platter offers a sophisticated taste experience. Perfect for those who appreciate Asian cuisine and want to sample multiple dishes. Pairs beautifully with green tea, sake, or Asian beer."
            },
            {
                id: "platter004",
                name: "Indian Street Food Platter",
                description: "Authentic street food selection with aloo tikki, pani puri, bhel puri, and dahi vada",
                basePrice: 240,
                sizes: {
                    small: { price: 240, quantity: 1 },
                    medium: { price: 430, quantity: 2 },
                    large: { price: 620, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/e16ce671-919e-4d4b-84c3-08581d96e02b.png",
                popular: true,
                story: "Our Indian Street Food Platter brings the vibrant flavors of Indian streets to your table. This colorful assortment features crispy aloo tikki (spiced potato patties) topped with chutneys and yogurt, pani puri (crispy hollow shells filled with spicy tangy water), bhel puri (puffed rice mixed with vegetables and chutneys), and dahi vada (soft lentil fritters soaked in creamy yogurt). Each item is garnished with sev (crispy chickpea noodles), fresh coriander, and a variety of chutneys. This platter is perfect for those who love bold, tangy, and spicy flavors. Pairs wonderfully with masala chai, sweet lassi, or cold beverages."
            },
            {
                id: "platter005",
                name: "Mediterranean Mezze Platter",
                description: "Middle Eastern selection with hummus, baba ganoush, falafel, stuffed grape leaves, and pita",
                basePrice: 290,
                sizes: {
                    small: { price: 290, quantity: 1 },
                    medium: { price: 520, quantity: 2 },
                    large: { price: 750, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/a1ff81d6-2506-4a4a-90c2-2cfcba343ed0.png",
                popular: true,
                story: "The Mediterranean Mezze Platter offers a taste of the Middle East with an array of classic vegetarian dishes. This healthy and flavorful platter includes creamy hummus, smoky baba ganoush (roasted eggplant dip), crispy falafel balls, stuffed grape leaves, marinated olives, fresh cherry tomatoes, cucumber slices, and warm pita bread triangles. Everything is drizzled with premium olive oil and sprinkled with za'atar spice. This platter is perfect for sharing and offers a lighter, healthier option without compromising on taste. Pairs beautifully with mint tea, Turkish coffee, or white wine."
            }
        ]
    },


    // ==========================================
    // BISCUITS & COOKIES
    // ==========================================
    // Crunchy & Chewy
    // ==========================================
    "biscuits-cookies-crunchy": {
        category: "Crunchy & Chewy",
        description: "Classic chocolate chip cookies with chunks of premium chocolate, crispy outside and chewy inside",
        items: [
            {
                id: "cookie001",
                name: "Classic Chocolate Chip Cookies",
                description: "Traditional cookies with premium chocolate chips, crispy edges and soft center",
                basePrice: 80,
                sizes: {
                    small: { price: 80, quantity: 1 },
                    medium: { price: 140, quantity: 2 },
                    large: { price: 200, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/005884f3-d35d-4dcc-88e5-873c096b481d.png",
                popular: true,
                story: "Our Classic Chocolate Chip Cookies are baked fresh daily using a time-honored recipe that creates the perfect balance between crispy edges and a soft, chewy center. We use premium Belgian chocolate chips that melt beautifully, creating pockets of rich chocolate throughout each cookie. The dough is made with real butter and brown sugar, giving it a deep, caramelized flavor that pairs wonderfully with any coffee. These cookies are the ultimate comfort food, evoking memories of home baking while delivering a gourmet experience. Whether you're enjoying one with your morning latte or as an afternoon treat with cold brew, our chocolate chip cookies are the perfect sweet companion."
            },
            {
                id: "cookie002",
                name: "Oatmeal Raisin Cookies",
                description: "Wholesome oatmeal cookies with plump raisins and warm spices",
                basePrice: 75,
                sizes: {
                    small: { price: 75, quantity: 1 },
                    medium: { price: 130, quantity: 2 },
                    large: { price: 185, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/59bbaf50-4829-480b-b5f0-c2ed6c59d44e.png",
                popular: true,
                story: "Oatmeal Raisin Cookies offer a wholesome alternative to chocolate cookies while still delivering incredible flavor. Our recipe features rolled oats, plump raisins, and warm spices like cinnamon and nutmeg. The oats provide a hearty texture and nutty flavor, while the raisins add natural sweetness and chewiness. These cookies are slightly less sweet than chocolate chip cookies, making them perfect for those who prefer a more subtle sweetness. They're especially popular at breakfast time, paired with coffee or tea. The combination of oats and raisins also makes them feel a bit more nutritious, though they're still an indulgent treat."
            },
            {
                id: "cookie003",
                name: "Double Chocolate Cookies",
                description: "Rich chocolate cookies with chocolate chunks for ultimate chocolate lovers",
                basePrice: 90,
                sizes: {
                    small: { price: 90, quantity: 1 },
                    medium: { price: 160, quantity: 2 },
                    large: { price: 230, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/6d39a803-0cae-419c-b2ad-9d5cd1ea6481.png",
                popular: true,
                story: "For serious chocolate enthusiasts, our Double Chocolate Cookies deliver an intense chocolate experience. The cookie dough itself is made with premium cocoa powder, creating a rich, dark chocolate base. We then fold in generous amounts of dark and milk chocolate chunks, ensuring every bite is packed with chocolate. The result is a cookie that's fudgy, rich, and deeply satisfying. These cookies pair beautifully with milk, coffee, or even a scoop of vanilla ice cream. They're particularly popular among chocolate lovers who want maximum chocolate flavor in every bite."
            },
            {
                id: "cookie004",
                name: "Peanut Butter Cookies",
                description: "Classic peanut butter cookies with signature fork marks and nutty flavor",
                basePrice: 85,
                sizes: {
                    small: { price: 85, quantity: 1 },
                    medium: { price: 150, quantity: 2 },
                    large: { price: 215, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/0b94b313-94e6-4284-a8db-b5c93f058b6b.png",
                popular: false,
                story: "Our Peanut Butter Cookies are a nostalgic favorite featuring the rich, nutty flavor of real peanut butter. Each cookie is marked with the traditional crisscross fork pattern and baked until the edges are golden and slightly crispy while the center remains soft. We use creamy peanut butter and just the right amount of sugar to create a cookie that's sweet but not overwhelming, allowing the peanut butter flavor to shine. These cookies are perfect for peanut butter lovers and pair wonderfully with coffee, milk, or hot chocolate. They're also naturally gluten-free friendly when made with appropriate flour substitutes."
            },
            {
                id: "cookie005",
                name: "Sugar Cookies",
                description: "Buttery sugar cookies with colorful sprinkles and sweet icing",
                basePrice: 70,
                sizes: {
                    small: { price: 70, quantity: 1 },
                    medium: { price: 120, quantity: 2 },
                    large: { price: 170, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/8f71c91d-193d-4009-b13f-c529197af6fa.png",
                popular: true,
                story: "Sugar Cookies are a versatile classic that we decorate with colorful sprinkles and sweet icing. These buttery, tender cookies have a delicate crumb and subtle vanilla flavor that makes them universally appealing. We often customize them for holidays and special occasions with themed decorations. The simple sweetness of sugar cookies makes them perfect for children and adults alike. They're wonderful with tea or coffee and make excellent gifts. During holidays, our decorated sugar cookies become particularly popular, featuring festive designs that celebrate the season."
            },
            {
                id: "cookie006",
                name: "Blueberry Muffins",
                description: "Moist muffins bursting with fresh blueberries and golden crumb topping",
                basePrice: 100,
                sizes: {
                    small: { price: 100, quantity: 1 },
                    medium: { price: 180, quantity: 2 },
                    large: { price: 260, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/c0e366fd-46ee-4789-b685-4a824501cfd2.png",
                popular: true,
                story: "Our Blueberry Muffins are a breakfast favorite that combines wholesome ingredients with indulgent flavor. Each muffin is packed with plump, juicy blueberries that burst with sweetness in every bite. The batter is made with buttermilk for extra moisture and a hint of lemon zest that brightens the flavor. Topped with a buttery crumb streusel that adds a delightful crunch, these muffins are baked until golden brown. They're perfect for breakfast on the go, paired with a cappuccino, or as a mid-morning snack with your favorite latte. The natural antioxidants from the blueberries make this treat feel a little less guilty too!"
            },
            
        ]
    },

    // ==========================================
    // Soft & Fluffy
    // ==========================================
    "biscuits-cookies-soft-fluffy": {
        category: "Soft & Fluffy",
        description: "Freshly baked blueberry muffins with golden tops and bursting with juicy blueberries",
        items: [
            {
                id: "fluffy001",
                name: "Blueberry Muffins",
                description: "Moist muffins bursting with fresh blueberries and golden crumb topping",
                basePrice: 100,
                sizes: {
                    small: { price: 100, quantity: 1 },
                    medium: { price: 180, quantity: 2 },
                    large: { price: 260, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/61b0e6b0-babb-4a22-89a7-ec404171bd04.png",
                popular: true,
                story: "Our Blueberry Muffins are a breakfast favorite that combines wholesome ingredients with indulgent flavor. Each muffin is packed with plump, juicy blueberries that burst with sweetness in every bite. The batter is made with buttermilk for extra moisture and a hint of lemon zest that brightens the flavor. Topped with a buttery crumb streusel that adds a delightful crunch, these muffins are baked until golden brown. They're perfect for breakfast on the go, paired with a cappuccino, or as a mid-morning snack with your favorite latte. The natural antioxidants from the blueberries make this treat feel a little less guilty too!"
            },
            {
                id: "fluffy002",
                name: "Chocolate Chip Muffins",
                description: "Fluffy muffins loaded with melted chocolate chips and golden tops",
                basePrice: 95,
                sizes: {
                    small: { price: 95, quantity: 1 },
                    medium: { price: 170, quantity: 2 },
                    large: { price: 245, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/d1458351-549c-4e65-be2c-de14fb8b374e.png",
                popular: true,
                story: "Chocolate Chip Muffins are like having dessert for breakfast, and we're not complaining! These fluffy, tender muffins are studded with premium chocolate chips that melt slightly during baking, creating pockets of gooey chocolate throughout. The muffin base is lightly sweetened and has a cake-like texture that's both satisfying and not too heavy. The golden dome tops are slightly crispy, providing a nice textural contrast to the soft interior. These muffins are perfect for chocolate lovers who want their morning treat to be a bit more indulgent. They pair wonderfully with coffee, hot chocolate, or milk."
            },
            {
                id: "fluffy003",
                name: "Banana Nut Muffins",
                description: "Moist banana muffins with walnuts and warm spices",
                basePrice: 95,
                sizes: {
                    small: { price: 95, quantity: 1 },
                    medium: { price: 170, quantity: 2 },
                    large: { price: 245, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/89a68bee-10dd-472c-b425-04986fa9190e.png",
                popular: false,
                story: "Banana Nut Muffins are a wholesome choice that transforms overripe bananas into something magical. These muffins are incredibly moist and tender, with a deep banana flavor enhanced by warm spices like cinnamon and nutmeg. We fold in chopped walnuts for added texture and a subtle earthy note. Each muffin is perfectly sweetened—not too sugary, allowing the natural banana flavor to shine through. The combination of banana and walnuts also provides good nutrition, making these muffins a more guilt-free indulgence. They're perfect for breakfast with coffee or as an afternoon snack with tea."
            },
            {
                id: "fluffy004",
                name: "Lemon Poppy Seed Muffins",
                description: "Light and zesty muffins with fresh lemon and crunchy poppy seeds",
                basePrice: 100,
                sizes: {
                    small: { price: 100, quantity: 1 },
                    medium: { price: 180, quantity: 2 },
                    large: { price: 260, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/11e7f9c5-de18-4d56-8ad8-c1a94c19b919.png",
                popular: true,
                story: "Lemon Poppy Seed Muffins offer a bright, refreshing flavor that's perfect for spring and summer. These muffins feature fresh lemon zest and juice that provide a vibrant citrus flavor, while poppy seeds add a subtle crunch and visual appeal. The muffins are topped with a sweet lemon glaze that adds extra moisture and flavor. They're light, fluffy, and not too sweet, making them perfect for breakfast or an afternoon snack. The bright, sunny flavor pairs beautifully with tea or light coffee drinks. These elegant muffins are also popular for brunch gatherings and special occasions."
            },
            {
                id: "fluffy005",
                name: "Chocolate Chip Muffins",
                description: "Fluffy muffins loaded with melted chocolate chips and golden tops",
                basePrice: 95,
                sizes: {
                    small: { price: 95, quantity: 1 },
                    medium: { price: 170, quantity: 2 },
                    large: { price: 245, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/31617db9-0291-44a1-bf78-3e71f73c5941.png",
                popular: true,
                story: "Chocolate Chip Muffins are like having dessert for breakfast, and we're not complaining! These fluffy, tender muffins are studded with premium chocolate chips that melt slightly during baking, creating pockets of gooey chocolate throughout. The muffin base is lightly sweetened and has a cake-like texture that's both satisfying and not too heavy. The golden dome tops are slightly crispy, providing a nice textural contrast to the soft interior. These muffins are perfect for chocolate lovers who want their morning treat to be a bit more indulgent. They pair wonderfully with coffee, hot chocolate, or milk."
            },
        ]
    },

    // ==========================================
    // Buttery & Flaky
    // ==========================================
    "croissants-pastries-buttery": {
        category: "Buttery & Flaky",
        description: "Buttery, flaky French croissants with golden layers, baked fresh every morning",
        items: [
            {
                id: "croissant001",
                name: "Plain Butter Croissant",
                description: "Classic French croissant with hundreds of buttery, flaky layers",
                basePrice: 120,
                sizes: {
                    small: { price: 120, quantity: 1 },
                    medium: { price: 220, quantity: 2 },
                    large: { price: 320, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/1951191d-c7bb-447a-a6e8-fdb500879d1a.png",
                popular: true,
                story: "Our Plain Butter Croissants are crafted using the traditional French lamination technique, where butter is folded into the dough multiple times to create hundreds of delicate, flaky layers. Each croissant is hand-rolled and shaped, then baked until golden brown with a crispy exterior that shatters at first bite, revealing a soft, buttery interior. The aroma alone is enough to transport you to a Parisian café. These croissants are the perfect accompaniment to a café au lait or espresso, embodying the classic French breakfast experience. They're best enjoyed fresh from the oven when the layers are at their crispiest."
            },
            {
                id: "croissant002",
                name: "Chocolate Croissant",
                description: "Buttery croissant filled with rich dark chocolate batons",
                basePrice: 140,
                sizes: {
                    small: { price: 140, quantity: 1 },
                    medium: { price: 250, quantity: 2 },
                    large: { price: 360, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/b393861e-6300-4c3b-927c-07e120d9ec1d.png",
                popular: true,
                story: "The Chocolate Croissant, or 'Pain au Chocolat' in French, takes our classic croissant to the next level by adding batons of premium dark chocolate. During baking, the chocolate melts slightly, creating pockets of rich, gooey chocolate throughout the flaky pastry. The combination of buttery, crispy layers and melted chocolate is simply irresistible. This pastry is perfect for those who want their breakfast to feel like dessert. It pairs beautifully with a cappuccino or hot chocolate, making it a favorite among chocolate lovers of all ages."
            },
            {
                id: "croissant003",
                name: "Almond Croissant",
                description: "Croissant filled with almond cream and topped with sliced almonds",
                basePrice: 150,
                sizes: {
                    small: { price: 150, quantity: 1 },
                    medium: { price: 270, quantity: 2 },
                    large: { price: 390, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/23d190f3-87c3-4644-9b1e-eecbe1bb97e7.png",
                popular: true,
                story: "Our Almond Croissant is a luxurious pastry that features a buttery croissant filled with rich almond cream (frangipane) and topped with sliced almonds and powdered sugar. The almond cream is made from ground almonds, butter, sugar, and eggs, creating a sweet, nutty filling that complements the flaky pastry perfectly. After baking, the almonds on top become toasted and crunchy, adding another layer of texture. This croissant is more substantial than a plain one, making it perfect for those who want a more filling breakfast. It pairs wonderfully with coffee or tea and is a favorite among almond lovers."
            },
            {
                id: "croissant004",
                name: "Cheese Croissant",
                description: "Savory croissant filled with melted cheese and herbs",
                basePrice: 130,
                sizes: {
                    small: { price: 130, quantity: 1 },
                    medium: { price: 230, quantity: 2 },
                    large: { price: 330, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/25a03f8b-c32e-4c45-b1e5-d889da4e7140.png",
                popular: false,
                story: "The Cheese Croissant offers a savory alternative to sweet pastries. Our buttery croissant is filled with a blend of melted cheeses—typically Gruyère and cheddar—along with fresh herbs like thyme and chives. The cheese melts during baking, creating a gooey, savory filling that contrasts beautifully with the flaky, buttery pastry. This croissant is perfect for those who prefer savory breakfast options or as a light lunch paired with soup or salad. It's particularly popular among customers who want something substantial but not sweet, and it pairs excellently with black coffee or an Americano."
            },
            {
                id: "croissant005",
                name: "Ham & Cheese Croissant",
                description: "Savory croissant with premium ham and melted Swiss cheese",
                basePrice: 160,
                sizes: {
                    small: { price: 160, quantity: 1 },
                    medium: { price: 280, quantity: 2 },
                    large: { price: 400, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/cf4479b8-3a19-4897-a67c-a1a8c4268d17.png",
                popular: true,
                story: "Our Ham & Cheese Croissant is a complete meal in a pastry, featuring premium sliced ham and melted Swiss cheese tucked inside our signature buttery croissant. This savory pastry is inspired by the French 'Croque Monsieur' and offers a perfect balance of salty ham, creamy cheese, and flaky pastry. It's substantial enough to serve as breakfast or lunch and is particularly popular among customers looking for a protein-rich option. The combination of ham and cheese is a classic that never goes out of style, and when wrapped in our delicate croissant layers, it becomes something truly special."
            }
        ]
    },
    
    // ==========================================
    // Crispy & Buttery
    // ==========================================
    "croissants-pastries-crispy-buttery": {
        category: "Crispy & Buttery",
        description: "Selection of butter cookies and biscuits in various shapes, perfect with tea or coffee",
        items: [
            {
                id: "buttery001",
                name: "Classic Shortbread Biscuits",
                description: "Traditional buttery shortbread with a melt-in-your-mouth texture",
                basePrice: 120,
                sizes: {
                    small: { price: 120, quantity: 1 },
                    medium: { price: 220, quantity: 2 },
                    large: { price: 320, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/925062/2026-01-22/c6787735-56de-47ce-b726-b520fa618164.png",
                popular: true,
                story: "Our Classic Shortbread Biscuits are made with premium butter, creating a rich, crumbly texture that melts in your mouth. These golden biscuits follow a traditional recipe with just three simple ingredients: butter, sugar, and flour. The result is a perfectly balanced sweetness with an irresistible buttery flavor that pairs wonderfully with tea or coffee."
            },
            {
                id: "buttery002",
                name: "Assorted Butter Cookies",
                description: "Selection of handcrafted butter cookies in various delightful shapes",
                basePrice: 130,
                sizes: {
                    small: { price: 130, quantity: 1 },
                    medium: { price: 240, quantity: 2 },
                    large: { price: 350, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/925062/2026-01-22/764c7141-fcff-4b36-aa5e-e288648065a5.png",
                popular: true,
                story: "Our Assorted Butter Cookies collection features a delightful variety of shapes including rounds, rectangles, and stars. Each cookie is crafted with premium European butter for that authentic, rich flavor. The crispy texture and golden color make these cookies perfect for any occasion, whether enjoyed with your morning coffee or as an afternoon treat."
            },
            {
                id: "buttery003",
                name: "Chocolate Chip Cookies",
                description: "Classic cookies loaded with premium chocolate chunks",
                basePrice: 140,
                sizes: {
                    small: { price: 140, quantity: 1 },
                    medium: { price: 250, quantity: 2 },
                    large: { price: 360, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/925062/2026-01-22/6d43901f-95c9-4c57-b049-8ec6039d996a.png",
                popular: true,
                story: "These Chocolate Chip Cookies are loaded with generous chunks of premium dark and milk chocolate. Baked to perfection with golden brown edges and a soft, chewy center, each cookie delivers the perfect balance of buttery dough and rich chocolate. Made with real butter and high-quality chocolate, these cookies are a timeless favorite that never disappoints."
            },
            {
                id: "buttery004",
                name: "Almond Butter Cookies",
                description: "Delicate butter cookies topped with whole roasted almonds",
                basePrice: 150,
                sizes: {
                    small: { price: 150, quantity: 1 },
                    medium: { price: 260, quantity: 2 },
                    large: { price: 370, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/925062/2026-01-22/367d5e85-dda1-4d0b-b471-8fd4199f0f66.png",
                popular: false,
                story: "Our Almond Butter Cookies combine the richness of premium butter with the nutty crunch of whole roasted almonds. Each round cookie is topped with a perfectly roasted almond, adding both visual appeal and a delightful textural contrast. The subtle almond flavor complements the buttery base, creating an elegant cookie that's perfect for special occasions or as a sophisticated treat with your favorite beverage."
            }
        ]
    },


    // ==========================================
    // SWEET TREATS & DESSERTS
    // ==========================================
    // Decadent Chocolate
    // ==========================================
    "sweet-treats-decadent": {
        category: "Decadent Chocolate",
        description: "Rich dark chocolate brownies with fudgy texture, dusted with cocoa powder and chocolate drizzle",
        items: [
            {
                id: "treat001",
                name: "Classic Chocolate Brownies",
                description: "Rich, fudgy brownies with crackly top and dense, moist center",
                basePrice: 90,
                sizes: {
                    small: { price: 90, quantity: 1 },
                    medium: { price: 160, quantity: 2 },
                    large: { price: 230, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/3746709b-4f8d-4396-ae29-13eb3965c2a7.png",
                popular: true,
                story: "Our Classic Chocolate Brownies are a chocolate lover's dream, made with premium dark chocolate and cocoa powder for an intensely rich flavor. The recipe creates a fudgy, dense texture with a signature crackly top that chocolate enthusiasts adore. Each brownie is baked to perfection—not too cakey, not too gooey, but just right. We use real butter and eggs to create that luxurious mouthfeel, and a touch of espresso powder that enhances the chocolate flavor without adding coffee taste. These brownies pair beautifully with a glass of cold milk, an iced latte, or even a scoop of vanilla ice cream for an extra special treat."
            },
            {
                id: "treat002",
                name: "Walnut Brownies",
                description: "Fudgy chocolate brownies with crunchy walnuts throughout",
                basePrice: 100,
                sizes: {
                    small: { price: 100, quantity: 1 },
                    medium: { price: 180, quantity: 2 },
                    large: { price: 260, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/92fe5956-1032-40f4-b4f8-7ef653f6109c.png",
                popular: true,
                story: "Walnut Brownies add a delightful crunch and nutty flavor to our classic fudgy brownie recipe. We fold generous amounts of toasted walnuts into the batter, creating a perfect textural contrast between the dense, chocolatey brownie and the crunchy nuts. The walnuts also add a subtle earthiness that complements the rich chocolate beautifully. These brownies are particularly popular among those who appreciate the classic brownie-walnut combination that's been beloved for generations. The nuts also add healthy fats and protein, making these brownies slightly more nutritious (though still deliciously indulgent!)."
            },
            {
                id: "treat003",
                name: "Cheesecake Brownies",
                description: "Chocolate brownies swirled with creamy cheesecake for a marbled effect",
                basePrice: 110,
                sizes: {
                    small: { price: 110, quantity: 1 },
                    medium: { price: 200, quantity: 2 },
                    large: { price: 290, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/d00122cd-08dc-402c-86e1-c403a363a7bb.png",
                popular: true,
                story: "Cheesecake Brownies combine two beloved desserts into one spectacular treat. We start with our rich chocolate brownie batter, then swirl in a tangy cream cheese mixture to create a beautiful marbled effect. The cheesecake layer adds a creamy, slightly tangy contrast to the intense chocolate, creating a more complex flavor profile. Each bite offers a perfect balance of rich chocolate and smooth cheesecake. These brownies are particularly popular among customers who can't decide between chocolate and cheesecake—now they can have both! They're best served slightly chilled and pair wonderfully with coffee or tea."
            },
            {
                id: "treat004",
                name: "Red Velvet Brownies",
                description: "Velvety red brownies with cream cheese swirl and cocoa flavor",
                basePrice: 110,
                sizes: {
                    small: { price: 110, quantity: 1 },
                    medium: { price: 200, quantity: 2 },
                    large: { price: 290, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/880d921f-afd9-4113-9cb1-50c7b928c133.png",
                popular: false,
                story: "Red Velvet Brownies offer a unique twist on traditional brownies with their distinctive red color and subtle cocoa flavor. These brownies have a velvety, tender texture that's less dense than traditional chocolate brownies. We swirl in a cream cheese mixture that adds tanginess and creates a beautiful contrast against the red brownie base. The flavor is more subtle than regular chocolate brownies, with hints of cocoa, vanilla, and a slight tanginess from buttermilk. These brownies are perfect for special occasions and make a stunning presentation. They're particularly popular around Valentine's Day and other celebrations."
            },
            {
                id: "treat005",
                name: "Salted Caramel Brownies",
                description: "Rich chocolate brownies with gooey caramel swirls and sea salt flakes",
                basePrice: 120,
                sizes: {
                    small: { price: 120, quantity: 1 },
                    medium: { price: 220, quantity: 2 },
                    large: { price: 320, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/85b8ba5a-b7b6-4839-beff-b0456bb827a0.png",
                popular: true,
                story: "Salted Caramel Brownies are the ultimate indulgence for those who love the sweet-salty combination. Our fudgy chocolate brownies are swirled with homemade salted caramel sauce that creates pockets of gooey sweetness throughout. The top is drizzled with more caramel and finished with flaky sea salt that enhances both the chocolate and caramel flavors. The salt cuts through the sweetness perfectly, creating a sophisticated flavor profile that's both decadent and balanced. These brownies are incredibly popular and often sell out quickly. They pair wonderfully with espresso, cold brew, or a glass of cold milk."
            },
            {
                id: "treat006",
                name: "Triple Chocolate Brownies",
                description: "Ultra-rich brownies with dark, milk, and white chocolate for chocolate lovers",
                basePrice: 115,
                sizes: {
                    small: { price: 115, quantity: 1 },
                    medium: { price: 210, quantity: 2 },
                    large: { price: 305, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/605e045f-9015-413a-a78e-22403e23147e.png",
                popular: true,
                story: "Triple Chocolate Brownies are a chocolate lover's ultimate fantasy. We start with a dark chocolate brownie base, then fold in chunks of milk chocolate and white chocolate chips. As they bake, the chocolates melt into pockets of different chocolate intensities, creating a complex flavor experience in every bite. The top is finished with a glossy chocolate ganache for an extra layer of decadence. These brownies offer three distinct chocolate experiences in one treat—the intense dark chocolate base, creamy milk chocolate pockets, and sweet white chocolate bursts. Perfect for serious chocolate enthusiasts who believe you can never have too much chocolate!"
            },
            {
                id: "treat007",
                name: "Peanut Butter Swirl Brownies",
                description: "Fudgy chocolate brownies with creamy peanut butter swirls and chocolate chips",
                basePrice: 110,
                sizes: {
                    small: { price: 110, quantity: 1 },
                    medium: { price: 200, quantity: 2 },
                    large: { price: 290, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/926970/2026-01-23/d8435d46-5c12-4437-a662-9bbedc5457ed.png",
                popular: true,
                story: "Peanut Butter Swirl Brownies combine two classic flavors that are simply meant to be together. Our rich chocolate brownie batter is swirled with creamy peanut butter, creating a beautiful marbled pattern and ensuring every bite has both chocolate and peanut butter. We add chocolate chips throughout for extra chocolate pockets and finish with a peanut butter drizzle on top. The combination of fudgy chocolate and creamy, slightly salty peanut butter creates an irresistible flavor profile. These brownies are perfect for fans of peanut butter cups and chocolate-peanut butter combinations. They pair wonderfully with cold milk or a peanut butter milkshake."
            }
        ]
    },

    // ==========================================
    // Moist & Nutty
    // ==========================================
    "sweet-treats-moist-nutty": {
        category: "Moist & Nutty",
        description: "Moist banana bread with visible banana pieces and walnuts, served warm with butter",
        items: [
            {
                id: "nutty001",
                name: "Classic Banana Bread",
                description: "Moist banana bread with walnuts and warm spices",
                basePrice: 95,
                sizes: {
                    small: { price: 95, quantity: 1 },
                    medium: { price: 170, quantity: 2 },
                    large: { price: 245, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/a034ed67-0654-48c7-a909-f12b3cb9689e.png",
                popular: true,
                story: "Our Classic Banana Bread is a comforting classic that transforms overripe bananas into something magical. The bread is incredibly moist and tender, with a deep banana flavor enhanced by warm spices like cinnamon and nutmeg. We fold in chopped walnuts for added texture and a subtle earthy note. Each slice is perfectly sweetened—not too sugary, allowing the natural banana flavor to shine through. This wholesome treat is perfect for breakfast with your morning coffee or as an afternoon snack. The aroma of freshly baked banana bread fills our café, creating an inviting, homey atmosphere that customers love."
            },
            {
                id: "nutty002",
                name: "Chocolate Chip Banana Bread",
                description: "Banana bread loaded with chocolate chips for extra indulgence",
                basePrice: 105,
                sizes: {
                    small: { price: 105, quantity: 1 },
                    medium: { price: 190, quantity: 2 },
                    large: { price: 275, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/dd493bbc-019b-4f32-a1ae-7c96a722f729.png",
                popular: true,
                story: "This variation adds generous amounts of premium chocolate chips to our classic banana bread recipe, creating an irresistible combination of flavors. The chocolate chips melt slightly during baking, creating pockets of gooey chocolate throughout the moist banana bread. The combination of sweet banana and rich chocolate is a match made in heaven, appealing to both children and adults. This indulgent version is perfect for those who want their banana bread to be a bit more dessert-like. It's wonderful served warm with a glass of cold milk or paired with your favorite coffee drink."
            },
            {
                id: "nutty003",
                name: "Zucchini Bread",
                description: "Moist spiced bread with shredded zucchini and chocolate chips",
                basePrice: 95,
                sizes: {
                    small: { price: 95, quantity: 1 },
                    medium: { price: 170, quantity: 2 },
                    large: { price: 245, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/b8c56e92-5e62-46dd-b95b-0ad26b7020bc.png",
                popular: false,
                story: "Zucchini Bread is a clever way to incorporate vegetables into a sweet treat! The shredded zucchini adds incredible moisture without any vegetable taste, creating a tender, cake-like bread. We enhance it with warm spices like cinnamon and nutmeg, and fold in chocolate chips for extra indulgence. The result is a bread that's both wholesome and delicious. Many customers are surprised to learn there's zucchini in it—they just taste a delicious, moist quick bread. It's perfect for those who want a slightly healthier treat without sacrificing flavor, and it pairs wonderfully with coffee or tea."
            },
            {
                id: "nutty004",
                name: "Pumpkin Bread",
                description: "Seasonal pumpkin bread with warming spices and pecans",
                basePrice: 100,
                sizes: {
                    small: { price: 100, quantity: 1 },
                    medium: { price: 180, quantity: 2 },
                    large: { price: 260, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/f1d74323-aaa0-43cd-ba7c-86fafbab3770.png",
                popular: true,
                story: "Pumpkin Bread is a fall favorite that captures the essence of autumn in every slice. Made with real pumpkin puree and a blend of warming spices including cinnamon, nutmeg, ginger, and cloves, this bread offers a complex, aromatic flavor profile. We fold in crunchy pecans that add texture and a subtle nutty taste. The result is a moist, flavorful bread with a beautiful golden-orange color. While especially popular during fall and winter months, this comforting bread is enjoyed year-round by pumpkin enthusiasts. It's perfect with a latte, chai, or hot apple cider."
            },
            {
                id: "nutty005",
                name: "Banana Bread",
                description: "Moist banana bread with walnuts and warm spices",
                basePrice: 95,
                sizes: {
                    small: { price: 95, quantity: 1 },
                    medium: { price: 170, quantity: 2 },
                    large: { price: 245, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/aa335032-9342-4076-911e-37354c24baff.png",
                popular: true,
                story: "Our Banana Bread is a comforting classic that transforms overripe bananas into something magical. The bread is incredibly moist and tender, with a deep banana flavor enhanced by warm spices like cinnamon and nutmeg. We fold in chopped walnuts for added texture and a subtle earthy note. Each slice is perfectly sweetened—not too sugary, allowing the natural banana flavor to shine through. This wholesome treat is perfect for breakfast with your morning coffee or as an afternoon snack. The aroma of freshly baked banana bread fills our café, creating an inviting, homey atmosphere that customers love."
            },
            {
                id: "nutty006",
                name: "Zucchini Bread",
                description: "Moist spiced bread with shredded zucchini and chocolate chips",
                basePrice: 95,
                sizes: {
                    small: { price: 95, quantity: 1 },
                    medium: { price: 170, quantity: 2 },
                    large: { price: 245, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/a1f3709b-39b4-40af-89ad-f5de8e08d8ba.png",
                popular: false,
                story: "Zucchini Bread is a clever way to incorporate vegetables into a sweet treat! The shredded zucchini adds incredible moisture without any vegetable taste, creating a tender, cake-like bread. We enhance it with warm spices like cinnamon and nutmeg, and fold in chocolate chips for extra indulgence. The result is a bread that's both wholesome and delicious. Many customers are surprised to learn there's zucchini in it—they just taste a delicious, moist quick bread. It's perfect for those who want a slightly healthier treat without sacrificing flavor, and it pairs wonderfully with coffee or tea."
            }
        ]
    },

    // ==========================================
    // Luxury Assortment
    // ==========================================
    "sweet-treats-luxury-assortment": {
        category: "Luxury Assortment",
        description: "Assorted premium chocolates and truffles in dark, milk, and white chocolate varieties",
        items: [
            {
                id: "luxury001",
                name: "Assorted Premium Chocolates",
                description: "Selection of luxury chocolates in dark, milk, and white varieties",
                basePrice: 150,
                sizes: {
                    small: { price: 150, quantity: 1 },
                    medium: { price: 270, quantity: 2 },
                    large: { price: 390, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/5384ec8d-47da-4355-8a2d-167a445af26f.png",
                popular: true,
                story: "Our Assorted Premium Chocolates feature a curated selection of handcrafted chocolates from artisan chocolatiers. The assortment includes dark chocolate (70% cocoa) with intense, sophisticated flavors; smooth milk chocolate with creamy sweetness; and white chocolate with vanilla notes. Each piece is carefully crafted with premium ingredients and unique fillings like caramel, ganache, praline, and fruit. These chocolates make perfect gifts or a luxurious treat for yourself. They pair beautifully with espresso or red wine and are particularly popular during holidays and special occasions. Each chocolate is a small work of art, both visually and in terms of flavor."
            },
            {
                id: "luxury002",
                name: "Dark Chocolate Truffles",
                description: "Handmade truffles with rich ganache center dusted with cocoa",
                basePrice: 120,
                sizes: {
                    small: { price: 120, quantity: 1 },
                    medium: { price: 220, quantity: 2 },
                    large: { price: 320, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/4db9ec42-8fb0-4b42-a817-d14c81bb2cb0.png",
                popular: true,
                story: "Dark Chocolate Truffles are the epitome of chocolate luxury. Each truffle features a silky-smooth ganache center made from premium dark chocolate and cream, hand-rolled and dusted with fine cocoa powder. The ganache melts on your tongue, releasing intense chocolate flavors with subtle notes of vanilla and sometimes a hint of liqueur. These truffles are made fresh in small batches to ensure the highest quality. They're perfect as an after-dinner treat with espresso or as a special gift for chocolate connoisseurs. The rich, intense flavor makes them a favorite among serious chocolate lovers who appreciate quality over quantity."
            },
            {
                id: "luxury003",
                name: "Champagne Truffles",
                description: "Elegant truffles infused with champagne and coated in white chocolate",
                basePrice: 180,
                sizes: {
                    small: { price: 180, quantity: 1 },
                    medium: { price: 320, quantity: 2 },
                    large: { price: 460, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/44f6efe6-89bb-4729-80bd-195412f4d00a.png",
                popular: false,
                story: "Champagne Truffles are the epitome of luxury and elegance, featuring ganache infused with real champagne and coated in smooth white chocolate. These sophisticated treats offer a delicate balance of sweet chocolate and the subtle, effervescent notes of champagne. Often decorated with edible gold leaf, they make a stunning presentation for special occasions. The champagne adds a unique complexity to the chocolate, creating a refined flavor profile that's perfect for celebrations. These truffles are ideal for weddings, anniversaries, New Year's Eve, or any time you want to add a touch of glamour to your dessert experience."
            },
            {
                id: "luxury004",
                name: "Salted Caramel Chocolates",
                description: "Premium chocolates with gooey salted caramel centers",
                basePrice: 140,
                sizes: {
                    small: { price: 140, quantity: 1 },
                    medium: { price: 250, quantity: 2 },
                    large: { price: 360, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/e96fa342-90d2-4524-bbcc-bf6ee4ff31cc.png",
                popular: true,
                story: "Salted Caramel Chocolates feature a perfect balance of sweet and salty that has captivated chocolate lovers worldwide. Each chocolate contains a gooey salted caramel center that flows when you bite into it, encased in premium dark or milk chocolate. The sea salt doesn't just add a savory note—it actually enhances the caramel's richness while cutting through the sweetness, creating a more complex and satisfying flavor experience. These chocolates have become incredibly popular in recent years and make excellent gifts. The combination of smooth chocolate, buttery caramel, and crunchy sea salt creates a multi-sensory experience that keeps you coming back for more."
            },
            {
                id: "luxury005",
                name: "Hazelnut Praline Chocolates",
                description: "Crunchy hazelnut praline centers in smooth milk chocolate",
                basePrice: 160,
                sizes: {
                    small: { price: 160, quantity: 1 },
                    medium: { price: 290, quantity: 2 },
                    large: { price: 420, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924679/2026-01-22/1a5bd61c-29ff-43a8-acb4-a880307c0066.png",
                popular: true,
                story: "Hazelnut Praline Chocolates combine crunchy caramelized hazelnuts with smooth milk chocolate in a classic European tradition. The praline center is made by caramelizing hazelnuts with sugar, then grinding them to create a paste that's both crunchy and creamy. This filling is then enrobed in premium milk chocolate, creating a perfect balance of textures and flavors. The nutty, caramelized taste of the praline pairs beautifully with the creamy chocolate coating. These chocolates are reminiscent of famous European confections and are perfect for those who appreciate traditional, time-honored chocolate making techniques. They make excellent gifts and pair wonderfully with coffee or dessert wine."
            },
            {
                id: "luxury006",
                name: "Assorted Premium Chocolates",
                description: "Selection of luxury chocolates in dark, milk, and white varieties",
                basePrice: 150,
                sizes: {
                    small: { price: 150, quantity: 1 },
                    medium: { price: 270, quantity: 2 },
                    large: { price: 390, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/557a9369-fd0f-4db4-8f1b-7dbbbfb25846.png",
                popular: true,
                story: "Our Assorted Premium Chocolates feature a curated selection of handcrafted chocolates from artisan chocolatiers. The assortment includes dark chocolate (70% cocoa) with intense, sophisticated flavors; smooth milk chocolate with creamy sweetness; and white chocolate with vanilla notes. Each piece is carefully crafted with premium ingredients and unique fillings like caramel, ganache, praline, and fruit. These chocolates make perfect gifts or a luxurious treat for yourself. They pair beautifully with espresso or red wine and are particularly popular during holidays and special occasions. Each chocolate is a small work of art, both visually and in terms of flavor."
            },
        ]
    },

    // ==========================================
    // Delicate & Creamy
    // ==========================================
    "macarons-desserts-delicate": {
        category: "Delicate & Creamy",
        description: "Colorful French macarons in various flavors with delicate shells and creamy fillings",
        items: [
            {
                id: "macaron001",
                name: "Assorted French Macarons",
                description: "Selection of colorful macarons in various flavors",
                basePrice: 180,
                sizes: {
                    small: { price: 180, quantity: 1 },
                    medium: { price: 320, quantity: 2 },
                    large: { price: 460, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/30bfb559-57ce-470a-838f-c71152bb035f.png",
                popular: true,
                story: "Our Assorted French Macarons are delicate almond meringue cookies sandwiched with flavorful fillings. Each macaron features a smooth, slightly crispy shell with the signature 'feet' at the bottom, and a soft, chewy interior. The filling is made from buttercream, ganache, or jam, depending on the flavor. Our assortment includes classic flavors like vanilla, chocolate, raspberry, lemon, pistachio, and salted caramel. These elegant treats are perfect for special occasions or as a sophisticated afternoon snack. They pair beautifully with tea or coffee and make stunning gifts. Each macaron is a small work of art, as beautiful as it is delicious."
            },
            {
                id: "macaron002",
                name: "Raspberry Macarons",
                description: "Pink macarons with tangy raspberry buttercream filling",
                basePrice: 200,
                sizes: {
                    small: { price: 200, quantity: 1 },
                    medium: { price: 360, quantity: 2 },
                    large: { price: 520, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/ba309d5a-a84f-4ddd-ad2f-dd83bc68f0a2.png",
                popular: true,
                story: "Raspberry Macarons feature delicate pink shells filled with tangy raspberry buttercream or jam. The bright, fruity flavor of raspberries provides a refreshing contrast to the sweet almond shells. These macarons are made with real raspberry puree, giving them an authentic fruit flavor that's both sweet and tart. The pink color makes them particularly popular for celebrations, bridal showers, and Valentine's Day. They pair wonderfully with champagne, tea, or light coffee drinks. The combination of delicate texture and bright flavor makes these macarons a favorite among fruit lovers."
            },
            {
                id: "macaron003",
                name: "Chocolate Macarons",
                description: "Rich chocolate macarons with dark chocolate ganache filling",
                basePrice: 200,
                sizes: {
                    small: { price: 200, quantity: 1 },
                    medium: { price: 360, quantity: 2 },
                    large: { price: 520, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/bd1b6bc9-402f-48f1-b831-78f61c65fa17.png",
                popular: true,
                story: "Chocolate Macarons are a chocolate lover's dream in miniature form. The shells are made with cocoa powder, giving them a deep chocolate flavor, while the filling is a rich dark chocolate ganache made from premium chocolate and cream. The combination creates an intensely chocolatey experience that's still light and delicate thanks to the airy macaron shells. These macarons are perfect for those who want their chocolate fix in an elegant, refined form. They pair beautifully with espresso or red wine and are a sophisticated alternative to traditional chocolate desserts."
            },
            {
                id: "macaron004",
                name: "Vanilla Bean Cheesecake",
                description: "Creamy New York-style cheesecake with graham cracker crust",
                basePrice: 140,
                sizes: {
                    small: { price: 140, quantity: 1 },
                    medium: { price: 250, quantity: 2 },
                    large: { price: 360, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/602df996-a475-4a6b-be78-167d0968e97d.png",
                popular: true,
                story: "Our Vanilla Bean Cheesecake is a classic New York-style cheesecake featuring a rich, creamy filling made with real vanilla beans. The filling is dense and smooth, with a subtle tang from cream cheese and a sweet vanilla flavor that's not overwhelming. It sits on a buttery graham cracker crust that provides a perfect textural contrast. Each slice is topped with a light sour cream layer and can be served plain or with fresh berries. This cheesecake is the ultimate indulgence—rich, creamy, and absolutely delicious. It pairs wonderfully with coffee or dessert wine and is a favorite for celebrations."
            },
            {
                id: "macaron005",
                name: "Tiramisu",
                description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
                basePrice: 150,
                sizes: {
                    small: { price: 150, quantity: 1 },
                    medium: { price: 270, quantity: 2 },
                    large: { price: 390, quantity: 3 }
                },
                image: "https://mgx-backend-cdn.metadl.com/generate/images/924587/2026-01-22/a0002cd3-0304-4695-9704-59b7ffc41e80.png",
                popular: true,
                story: "Tiramisu is a beloved Italian dessert that perfectly combines coffee and dessert in one elegant creation. Our version features ladyfinger cookies soaked in strong espresso and coffee liqueur, layered with a rich mascarpone cream that's sweetened and flavored with vanilla. The whole dessert is dusted with cocoa powder, creating a beautiful presentation. The name 'tiramisu' means 'pick me up' in Italian, referring to the energizing effects of the coffee. This dessert is perfect for coffee lovers who want something sweet but not too heavy. It's particularly popular as an after-dinner treat and pairs beautifully with espresso or cappuccino."
            }
        ]
    },
};  

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Helper function to get menu by category
function getMenuByCategory(categorySlug) {
    return coffeeMenu[categorySlug] || null;
}

// Helper function to get item by ID
function getItemById(itemId) {
    for (const categoryKey in coffeeMenu) {
        const category = coffeeMenu[categoryKey];
        const item = category.items.find(i => i.id === itemId);
        if (item) {
            return { ...item, category: category.category };
        }
    }
    return null;
}
