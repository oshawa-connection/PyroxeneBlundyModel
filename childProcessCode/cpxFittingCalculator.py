#!/usr/bin/env python3
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import numpy as np
from scipy.optimize import curve_fit
import pandas as pd
import sys

#try:
#
ionsNamesInput = list((sys.argv[1].split(",")))
partitionCoefficientsInput = np.array((sys.argv[2].split(","))).astype(np.float)
temperature = np.float(sys.argv[3]) + 273.15

ionDf = pd.DataFrame ( {'ion': ['La',
'Ce',
'Pr',
'Nd',
'Sm',
'Eu',
'Gd',
'Tb',
'Dy',
'Ho',
'Er',
'Tm',
'Yb',
'Lu','Y'], 'radii': [1.160,
1.143,
1.126,
1.109,
1.079,
1.066,
1.053,
1.040,
1.027,
1.015,
1.004,
0.994,
0.985,
0.977,
1.019]})

inputDf = pd.DataFrame({'ion':ionsNamesInput,'DCpxLiquid':partitionCoefficientsInput})
final = pd.merge(ionDf, inputDf, how='inner', left_on="ion", right_on="ion")
final.sort_values(by= "radii",inplace=True)

def blundy_func(r_i,D_o,E,r_o):
    inner =  ((-4 * np.pi * E * 6.0221409*10**(23) * (r_o/2) * (r_i   - r_o )**2 + 1/3 * (r_i - r_o)**3))  / (8.314*temperature)
    #print('inner array')
    #print (inner)
    return D_o * np.exp(inner)

# =============================================================================
# Attempt to fit parameters to the data
# =============================================================================

#Initial parameter guesses for parameters
p0=[1.092110848188546,273624000000,2*10**(-11)]
upper  = [np.inf,np.inf,1.02189e-10]
lower = [-1000,0.0,0.0]
boundary =(lower,upper)

r_i_fit = np.array(final["radii"])

popt, pcov = curve_fit(blundy_func, r_i_fit* 10**(-10), np.array(final["DCpxLiquid"]),p0,maxfev=100000)


residuals = np.array(final["DCpxLiquid"]) - blundy_func(r_i_fit* 10**(-10), *popt)
ss_res = np.sum(residuals**2)
ss_tot = np.sum((np.array(final["DCpxLiquid"])-np.mean(np.array(final["DCpxLiquid"])))**2)
r_squared = 1 - (ss_res / ss_tot)

resultsDict = {"Do":popt[0],"E":popt[1],"Ro":popt[2],"R Squared":r_squared}


print (resultsDict)



