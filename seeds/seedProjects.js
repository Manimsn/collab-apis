// seeds/seedProjects.js
import Project from "../models/Project.js";
import User from "../models/User.js";

const projectNames = [
  "Tuscany Dine",
  "Oriental Express",
  "Urban Burger Hub",
  "Speedy Deli",
  "La Vie Elegante",
  "Michelin Star Bistro",
  "Brewer's Corner",
  "Java Bliss Cafe",
  "Skyline Gourmet",
  "Elite Dining Hall",
  "Rustic Tavern",
  "Sunset Grille",
  "Seaside Bites",
  "Mountain View Eatery",
  "The Grand Feast",
  "Royal Banquet",
  "Parisian Café",
  "Gourmet Street",
  "Firewood Steakhouse",
  "Coastal Cuisine",
  "Spice Symphony",
  "Harbor Seafood",
  "Garden Delights",
  "Fusion Eats",
  "The Classic Diner",
  "Heritage Kitchen",
  "Farmhouse Table",
  "Rooftop Indulgence",
  "Golden Spoon",
  "Savory Street",
  "Chef’s Table",
  "The Velvet Fork",
  "Culinary Haven",
  "Epicurean Delight",
  "Blue Bay Eatery",
  "The Secret Pantry",
  "The Ivory Plate",
  "Amber Flame Grill",
  "Sunflower Brunch House",
  "Fresco Bistro",
  "Olive Grove Café",
  "Cinnamon & Sage",
  "The Gilded Dish",
  "Neon Bites",
  "Maple Leaf Diner",
  "The Crimson Spoon",
  "Azure Rooftop Eatery",
  "The Cozy Corner",
  "The Heritage Grill",
  "Velvet Night Dining",
  "Flavors of the World",
  "Coastal Breeze Diner",
  "Gastronome Retreat",
  "Midnight Feast",
  "The Brisket House",
  "Cobalt Café",
  "Southern Comfort Kitchen",
  "Artisan Table",
  "Amber & Oak",
  "Harvest Moon Bistro",
  "The Glass House Diner",
  "Grandiose Gourmet",
  "Pasta & Prosecco",
  "Ember & Ash Steakhouse",
  "Celestial Café",
  "Aspen Grove Eatery",
  "The Painted Plate",
  "Seasoned & Co.",
  "Vineyard Views Dining",
  "Copper Kettle Tavern",
  "Fable & Fork",
  "The Majestic Meal",
  "Bistro Belle",
  "Sky Lantern Dining",
  "Vintage Fork",
  "The Maple Barn",
  "The Cozy Hearth",
  "Rosewood Dine",
  "Blue Ocean Grill",
  "The Golden Tandoor",
  "Lavish Lounge",
  "The Rustic Fork",
  "Celestial Eats",
  "Candlelight Dining",
  "The Bohemian Plate",
  "Aubergine & Thyme",
  "Ginger Blossom Café",
  "Moonlit Diner",
  "Horizon Terrace",
  "Eclipse Eatery",
  "Botanical Bites",
  "The Scarlet Spoon",
  "Glistening Grove Café",
  "Starlit Supper",
  "Feast & Vine",
  "Fountain Court Eatery",
  "Luxe Bites",
  "Platinum Palate",
  "Brasserie Noir",
  "Velvet & Vine",
  "Bayside Banquet",
  "Garnet Kitchen",
  "The Secret Chef",
  "The Citrus Garden",
  "Crestwood Dining",
  "Sunset Terrace",
  "The Indigo Fork",
  "The Cozy Pot",
  "Urban Harvest",
  "Silver Platter",
  "Whimsical Bites",
  "The Lakeside Feast",
  "Aurora Gourmet",
  "Ethereal Eats",
  "Lush Brunch Bar",
  "Evergreen Feast",
  "The Moon & Spoon",
  "Harvest Breeze Bistro",
  "Wild Thyme Eatery",
  "Dewdrop Dining",
  "Harmony Haven",
  "The Serene Spoon",
  "Flame & Sage",
  "Copper Spoon Grill",
  "Elegant Entrees",
  "The Timeless Tavern",
  "Crisp & Co.",
  "Pure Indulgence Dining",
  "Orchid Table",
  "Chateau Chic Café",
  "The Smoky Barrel",
  "Emerald Dining",
  "Renaissance Flavors",
  "The Grand Gourmet",
  "Victorian Table",
  "Celestial Gastronomy",
  "The Riverside Brunch",
  "Velvet Touch Dining",
  "Lavender Lounge",
  "The Opulent Table",
  "Grand Estate Eatery",
  "The Enchanted Feast",
  "Autumn Bliss Café",
  "Lighthouse Dining",
  "The Wishing Fork",
  "Gilded Luxe",
  "The Artisanal Chef",
  "Gourmet Horizon",
  "The Pearl Café",
  "Sun-Kissed Bistro",
  "Midtown Marvel Eatery",
  "The Cozy Retreat",
  "Ocean Breeze Dining",
  "Cedarwood Grill",
  "Skyview Supper",
  "Amber Glow Dining",
  "Vibrant Tastes",
  "Sapphire Gourmet",
  "The Cozy Lantern",
  "The Hidden Gem Café",
  "Crestwood Eats",
  "Bamboo Grove Diner",
  "Celestial Orchard",
  "Meadow’s Edge Dining",
  "The Crimson Plate",
  "The Lavish Plate",
  "Shimmering Spoon",
  "The Azure Table",
  "Summit Supper",
  "The Fireside Table",
  "Evergreen Bistro",
  "Bayside Terrace",
  "The Elegant Palate",
  "Culinary Haven 2.0",
  "Velvet Banquet",
  "Twilight Terrace",
  "Horizon Heights Dining",
  "Fleur de Lis Café",
  "Urban Oasis Eatery",
  "Enchanted Bistro",
  "Radiant Bites",
  "Everest Feast",
  "Golden Petal Dining",
  "The Starlit Bistro",
  "Ivory Gourmet",
  "Majestic Manor Meals",
  "Lavender Sky Lounge",
  "Lush Lagoon Dining",
  "Moonbeam Bistro",
  "Crimson Gourmet",
  "The Whispering Willow Café",
  "The Sapphire Fork",
  "Firelight Eats",
  "Glazed & Grazed",
  "Amber Waves Eatery",
  "Gossamer Gourmet",
  "The Timeless Taste",
  "Cedarwood Dining",
  "Maple Grove Banquet",
  "Bluebell Bistro",
  "Celestial Sunrise Café",
  "Whimsical Fork",
  "The Starry Spoon",
  "Everlasting Feast",
  "The Fireside Fork",
  "Stellar Gourmet",
  "The Golden Hour Diner",
  "Luminous Bites",
  "Opulent Eats",
  "The Verdant Table",
  "Lush Valley Dining",
  "Azure Breeze Eatery",
  "Serene Sky Dining",
  "The Secret Garden Eatery",
  "Crescent Moon Café",
  "Opal Fork Dining",
  "Whispering Pines Eatery",
  "Silver Stream Bistro",
  "The Sunlit Brunch",
  "Flavors of Eden",
  "The Horizon Banquet",
  "Timeless Table",
  "The Opulent Orchard",
  "The Starlit Feast",
  "Aurora Nights Dining",
  "Vivid Tastes",
  "Jewel Tones Bistro",
  "Frosted Fork",
  "Amber Ember Dining",
  "Fireside Feast",
  "The Meadow Supper",
  "The Enchanted Vineyard",
  "Oceanic Gourmet",
  "Golden Harvest Dining",
  "Plush Palate",
  "Hearthstone Feast",
  "Midnight Breeze Dining",
  "The Rustic Banquet",
  "Autumn Harvest Café",
  "Summit Tastes",
  "Twilight Tavern",
  "Celestial Banquet",
  "The Imperial Plate",
  "Vintage Gourmet",
  "Bayside Haven Dining",
  "The Crimson Tastes",
  "The Whispering Fork",
  "Dusk & Dawn Café",
  "Hidden Grove Dining",
  "Golden Age Banquet",
  "The Grand Hall Gourmet",
  "Velvet Sunset Bistro",
  "Timeless Epicurean",
  "Lakeside Bliss Dining",
  "Grand Harvest Eatery",
  "Moonlit Fork",
  "Fire & Ice Bistro",
  "The Enchanted Orchard",
  "Royal Tastes",
  "The Midnight Feast",
  "Golden Peak Dining",
  "The Whispering Chef",
  "Fireside Palate",
  "The Everlasting Fork",
  "The Heavenly Plate",
  "The Gourmet Alchemy",
  "Sunrise Harvest Café",
  "Jasmine Table",
  "Harvest Gold Eatery",
  "Horizon Brunch",
  "The Hidden Orchard",
  "Opal Spoon Café",
  "Sunbeam Tastes",
  "Summit Gourmet",
  "Sunkissed Haven",
  "Golden Sky Brunch",
  "The Cosmic Café",
  "The Timeless Gourmet",
  "The Moonbeam Meal",
  "Evergreen Grove Dining",
  "Gilded Bliss Bistro",
  "Lush Epicurean",
  "The Radiant Feast",
  "Enchanted Forest Dining",
  "Emerald Epicure",
  "Stardust Dining",
  "Summit Retreat Eatery",
  "Dewdrop Fork",
  "The Secret Taste",
  "The Twilight Banquet",
  "Silver Lake Gourmet",
];

export const seedProjects = async () => {
  const existingProjects = await Project.countDocuments();
  if (existingProjects > 0) return console.log("Projects already seeded.");

  const users = await User.find();
  const usedNames = new Set();
  const projects = [];

  users.forEach((user) => {
    const maxProjects =
      user.plan === "FREE" ? 2 : user.plan === "BASIC" ? 5 : 10;
    for (let i = 0; i < maxProjects; i++) {
      let projectName;
      do {
        projectName =
          projectNames[Math.floor(Math.random() * projectNames.length)];
      } while (usedNames.has(projectName));
      usedNames.add(projectName);

      projects.push({
        name: projectName,
        description: `A unique project focusing on ${projectName} in ${user.location}.`,
        location: user.location,
        createdBy: user._id,
        ownerEmail: user.email,
      });
    }
  });

  await Project.insertMany(projects);
  console.log("Projects seeded successfully.");
};
