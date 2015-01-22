# space
by Frederic Worm (MIT-License)

### space is a fully functional multiplayer asteroids/continuum like shooter in your browser

You can find it in action on http://space.toolset.io

It is one of my private fun projects in 2013/14 which i finally decided to make public.

The server part is fully in node.js and divided in 3 parts.
- ressource- and file server
- worldserver
- communication server

all 3 servers need to run to make it work. i divided into 3 parts to be able to scale it to a cluster later for making
one worldserver for each level but one comserver for one chunk of users.
 
The main problem with this project was performance. What you see is the result of heavy tweaking.
Since its my first realtime browser action game there was a lot to learn...




