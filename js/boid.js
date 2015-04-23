/**
 * This file contains the functions for the three fundamental rules of boids:
 *      1) Cohesion   - Steer toward the average position of neighbours
 *      2) Seperation - Avoid crowding neighbours
 *      3) Alignment  - Steer toward the average heading of neighbours
 *      
 * @author Oliver Hayman
 * @date 10th April 2015
 * @version 1.0
 */

/**
 * Cohesion
 * Sum the positions of all fish in the school, excluding the current one.
 * Divide by the number of fish -1 to get the average position of all the
 * fish (this could be thought of as a center of mass). Then subtract the
 * current position of the current fish and divide by 100 to take 1% of
 * this center of mass into account (to act more like a local neighbourhood)
 * 
 * @param school
 * @param fish
 * @return {THREE.Vector2}
 */
function cohesion(school, fish)
{
    var c = new THREE.Vector2();

    for(i =0; i < school.length; i++)
    {
        if(i != fish )//&& Math.abs(school[i].position.distanceTo(school[fish].position)) < 50)
        {
            c.add(school[i].position);
        }
    }
    c.divideScalar((school.length-1));
    c.sub(school[fish].position);
    return c.divideScalar(100);
}

/**
 * Separation
 * 
 * @param school
 * @param fish
 * @returns {THREE.Vector2}
 */
function separation(school, fish)
{
    var adjust = new THREE.Vector2();

    for(i = 0; i < school.length; i++)
    {
        if(i != fish)// && school[fish].position.distanceTo(school[i].position) < 100)
        {
            if(Math.abs(school[i].position.distanceTo(school[fish].position)) < 10)
            {
                var tmp = school[i].position.clone();
                tmp.sub(school[fish].position);
                adjust.sub(tmp);
            }
        }
    }
    return adjust;
}

/**
 * Alignment
 * 
 * @param school
 * @param fish
 * @returns
 */
function alignment(school, fish)
{
    var d = new THREE.Vector2();

    for(i=0;i<school.length; i++)
    {
        if(i != fish && school[i].position.distanceTo(school[fish].position) < 150)
        {
            d.add(school[i].velocity);
        }
    }
    d.divideScalar((school.length-1));
    d.sub(school[fish].velocity);
    return d.divideScalar(8);
}